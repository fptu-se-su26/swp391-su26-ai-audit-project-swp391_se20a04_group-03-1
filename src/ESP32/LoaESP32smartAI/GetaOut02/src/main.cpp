// =============================================================================
// CỔNG RA (GateOut) — ESP32
//
// Cùng kiến trúc MQTT với cổng vào (xem GateInTest + docs/mqtt_setup.md). Khác biệt:
//   - GATE_ID = "out"  -> topic smartparking/gate/out/{cmd,audio,status}
//   - Không có cảm biến cháy / LED / còi. Có 4 cảm biến đếm xe đang CHỜ ra.
//   - Cảm biến IR đảo cực so với cổng vào (IR_CAR_PRESENT = LOW).
//   - Câu thông báo do Pi dựng là câu RA ("... mời di chuyển ra cổng").
//
// BỎ hẳn kiểu "cứ 5 giây tự mở". Cổng chỉ mở khi backend gửi lệnh MQTT.
// Âm thanh chạy 1 task riêng (core 0) — nơi DUY NHẤT ghi I2S.
// =============================================================================
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <driver/i2s.h>
#include <math.h>

// ===== CẤU HÌNH MẠNG — SỬA CHO ĐÚNG MÔI TRƯỜNG =====
#define WIFI_SSID   "LogiPort"
#define WIFI_PASS   "logiport123"

#define MQTT_HOST   "ea8a7d82ce1d49cf9672b0771ce7511a.s1.eu.hivemq.cloud"
#define MQTT_PORT   8883
#define MQTT_USER   "smartparking"
#define MQTT_PASS   "logiport123"
#define MQTT_USE_TLS 1

#define GATE_ID     "out"

#define TOPIC_CMD    "smartparking/gate/" GATE_ID "/cmd"
#define TOPIC_AUDIO  "smartparking/gate/" GATE_ID "/audio"
#define TOPIC_STATUS "smartparking/gate/" GATE_ID "/status"

// ===== SERVO =====
#define SERVO_PIN 33
#define ANGLE_CLOSED 0
#define ANGLE_OPEN 90

// ===== I2S (MAX98357A) =====
#define I2S_BCLK 26
#define I2S_LRC 25
#define I2S_DOUT 27
#define I2S_DEFAULT_RATE 22050

#define IR_PIN 32          // cảm biến PHÍA SAU cổng: xe qua khỏi -> đóng
#define IR_WAIT_1 19       // 4 cảm biến đếm xe đang chờ ra
#define IR_WAIT_2 18
#define IR_WAIT_3 17
#define IR_WAIT_4 16

#define IR_CAR_PRESENT LOW  // cổng ra: CÓ xe = LOW
#define IR_NO_CAR HIGH

LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo gateServo;

#if MQTT_USE_TLS
WiFiClientSecure netClient;
#else
WiFiClient netClient;
#endif
PubSubClient mqtt(netClient);

// ===== STATE MACHINE =====
enum GateState {
  STATE_IDLE_CLOSED,
  STATE_OPENING,
  STATE_WAIT_CAR_PASS,
  STATE_SAFE_DELAY,
  STATE_CLOSING
};

GateState currentState = STATE_IDLE_CLOSED;
unsigned long stateStartTime = 0;
const char* currentLine2Msg = "Cho lenh MQTT";

int currentServoAngle = ANGLE_CLOSED;
unsigned long lastServoMoveTime = 0;
const int SERVO_MOVE_DELAY = 15;

volatile bool openRequested = false;
char pendingPlate[16] = "";
unsigned long lastMqttReconnect = 0;

// ===== HÀNG ĐỢI ÂM THANH =====
enum AudioType { AUDIO_BEEP, AUDIO_PLAY_URL };
struct AudioCmd {
  AudioType type;
  char url[200];
};
QueueHandle_t audioQueue;

// --------------------------------------------------------------------------
int getWaitingCars() {
  int count = 0;
  if (digitalRead(IR_WAIT_1) == IR_CAR_PRESENT) count++;
  if (digitalRead(IR_WAIT_2) == IR_CAR_PRESENT) count++;
  if (digitalRead(IR_WAIT_3) == IR_CAR_PRESENT) count++;
  if (digitalRead(IR_WAIT_4) == IR_CAR_PRESENT) count++;
  return count;
}

void updateDisplay(const char* line2) {
  int count = getWaitingCars();
  char buf1[17];
  snprintf(buf1, sizeof(buf1), "Goc:%2d|Cho:%dxe  ", currentServoAngle, count);
  char buf2[17];
  snprintf(buf2, sizeof(buf2), "%-16s", line2);
  lcd.setCursor(0, 0);
  lcd.print(buf1);
  lcd.setCursor(0, 1);
  lcd.print(buf2);
}

void changeState(GateState newState, const char* msg) {
  if (currentState != newState) {
    currentState = newState;
    stateStartTime = millis();
    currentLine2Msg = msg;
    updateDisplay(currentLine2Msg);
  }
}

// --------------------------------------------------------------------------
// I2S + âm thanh (giống hệt cổng vào — nơi duy nhất ghi I2S)
// --------------------------------------------------------------------------
void setupI2S() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = I2S_DEFAULT_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 256,
    .use_apll = false,
    .tx_desc_auto_clear = true,
    .fixed_mclk = 0
  };
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_BCLK,
    .ws_io_num = I2S_LRC,
    .data_out_num = I2S_DOUT,
    .data_in_num = I2S_PIN_NO_CHANGE
  };
  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pin_config);
}

void playBeep(int times) {
  const int sr = I2S_DEFAULT_RATE;
  // Đặt lại mono/16-bit: WAV vừa phát trước đó có thể đã đổi số kênh.
  i2s_set_clk(I2S_NUM_0, sr, I2S_BITS_PER_SAMPLE_16BIT, I2S_CHANNEL_MONO);
  const int n = sr * 120 / 1000;
  int16_t s;
  size_t bw;
  for (int t = 0; t < times; t++) {
    for (int i = 0; i < n; i++) {
      s = (int16_t)(9000.0 * sin(2.0 * M_PI * 1200.0 * i / sr));
      i2s_write(I2S_NUM_0, &s, sizeof(s), &bw, portMAX_DELAY);
    }
    i2s_zero_dma_buffer(I2S_NUM_0);
    vTaskDelay(90 / portTICK_PERIOD_MS);
  }
}

bool readExact(WiFiClient* stream, uint8_t* buf, size_t n) {
  size_t got = 0;
  unsigned long last = millis();
  while (got < n) {
    int a = stream->available();
    if (a <= 0) {
      if (!stream->connected() && stream->available() <= 0) return false;
      if (millis() - last > 4000) return false;
      vTaskDelay(1);
      continue;
    }
    int r = stream->read(buf + got, n - got);
    if (r > 0) { got += r; last = millis(); }
  }
  return true;
}

bool skipBytes(WiFiClient* stream, uint32_t n) {
  uint8_t tmp[64];
  while (n > 0) {
    size_t want = n < sizeof(tmp) ? n : sizeof(tmp);
    if (!readExact(stream, tmp, want)) return false;
    n -= want;
  }
  return true;
}

static inline uint32_t le32(const uint8_t* p) {
  return (uint32_t)p[0] | ((uint32_t)p[1] << 8) | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24);
}

void streamWavToI2S(const char* url) {
  HTTPClient http;
  WiFiClient client;
  if (!http.begin(client, url)) {
    Serial.printf("[audio] http.begin lỗi: %s\n", url);
    return;
  }
  int code = http.GET();
  if (code != HTTP_CODE_OK) {
    Serial.printf("[audio] HTTP %d cho %s\n", code, url);
    http.end();
    return;
  }
  WiFiClient* stream = http.getStreamPtr();

  uint8_t hdr[12];
  if (!readExact(stream, hdr, 12) ||
      memcmp(hdr, "RIFF", 4) != 0 || memcmp(hdr + 8, "WAVE", 4) != 0) {
    Serial.println("[audio] Không phải WAV hợp lệ");
    http.end();
    return;
  }

  uint32_t sampleRate = I2S_DEFAULT_RATE;
  uint16_t bits = 16, channels = 1;

  while (true) {
    uint8_t ch[8];
    if (!readExact(stream, ch, 8)) { http.end(); return; }
    uint32_t sz = le32(ch + 4);

    if (memcmp(ch, "fmt ", 4) == 0) {
      uint8_t fmt[16];
      uint32_t toread = sz > 16 ? 16 : sz;
      if (!readExact(stream, fmt, toread)) { http.end(); return; }
      channels = (uint16_t)fmt[2] | ((uint16_t)fmt[3] << 8);
      sampleRate = le32(fmt + 4);
      bits = (uint16_t)fmt[14] | ((uint16_t)fmt[15] << 8);
      if (sz > toread && !skipBytes(stream, sz - toread)) { http.end(); return; }
    } else if (memcmp(ch, "data", 4) == 0) {
      Serial.printf("[audio] WAV %uHz %ubit %uch, data=%u byte\n",
                    sampleRate, bits, channels, sz);
      // Lấy đúng tần số/độ sâu/số kênh từ header WAV. Piper xuất mono 16-bit 22050Hz,
      // nhưng đọc từ header thì đổi giọng khác cũng không phải sửa firmware.
      i2s_set_clk(I2S_NUM_0, sampleRate, (i2s_bits_per_sample_t)bits,
                  channels == 2 ? I2S_CHANNEL_STEREO : I2S_CHANNEL_MONO);
      // read() trả về số byte tuỳ TCP chia gói, rất hay LẺ. Mẫu là 16-bit (2 byte), nên
      // ghi thẳng r byte vào I2S sẽ cắt đôi mẫu và lệch byte vĩnh viễn từ đó -> rè.
      // Giữ phần dư lại, chỉ ghi trọn frame.
      const size_t frameBytes = (bits / 8) * (channels == 2 ? 2 : 1);
      static uint8_t buf[1024];
      uint32_t remaining = sz;
      size_t carry = 0;
      size_t bw;
      unsigned long last = millis();
      while (remaining > 0) {
        int a = stream->available();
        if (a <= 0) {
          if (!stream->connected() && stream->available() <= 0) break;
          if (millis() - last > 4000) break;
          vTaskDelay(1);
          continue;
        }
        size_t want = sizeof(buf) - carry;
        if (want > remaining) want = remaining;
        if (want > (size_t)a) want = (size_t)a;
        int r = stream->read(buf + carry, want);
        if (r > 0) {
          remaining -= r;
          last = millis();
          size_t have = carry + r;
          size_t writable = have - (have % frameBytes);
          if (writable > 0) i2s_write(I2S_NUM_0, buf, writable, &bw, portMAX_DELAY);
          carry = have - writable;
          if (carry > 0) memmove(buf, buf + writable, carry);
        }
      }
      i2s_zero_dma_buffer(I2S_NUM_0);
      break;
    } else {
      if (!skipBytes(stream, sz)) { http.end(); return; }
    }
  }
  http.end();
}

void audioTask(void* pv) {
  AudioCmd cmd;
  for (;;) {
    if (xQueueReceive(audioQueue, &cmd, portMAX_DELAY) == pdTRUE) {
      if (cmd.type == AUDIO_BEEP) playBeep(3);
      else if (cmd.type == AUDIO_PLAY_URL) streamWavToI2S(cmd.url);
    }
  }
}

void requestBeep() {
  AudioCmd c;
  c.type = AUDIO_BEEP;
  c.url[0] = 0;
  xQueueSend(audioQueue, &c, 0);
}

void requestPlay(const char* url) {
  AudioCmd c;
  c.type = AUDIO_PLAY_URL;
  strncpy(c.url, url, sizeof(c.url) - 1);
  c.url[sizeof(c.url) - 1] = 0;
  xQueueSend(audioQueue, &c, 0);
}

// --------------------------------------------------------------------------
// MQTT
// --------------------------------------------------------------------------
void publishStatus(const char* event) {
  JsonDocument doc;
  doc["event"] = event;
  doc["gate"] = GATE_ID;
  doc["waiting"] = getWaitingCars();
  char buf[160];
  size_t n = serializeJson(doc, buf);
  mqtt.publish(TOPIC_STATUS, (const uint8_t*)buf, n, false);
}

void onMqttMessage(char* topic, byte* payload, unsigned int len) {
  JsonDocument doc;
  if (deserializeJson(doc, payload, len)) {
    Serial.println("[mqtt] Payload không phải JSON, bỏ qua");
    return;
  }
  if (strcmp(topic, TOPIC_CMD) == 0) {
    const char* action = doc["action"] | "";
    if (strcmp(action, "open") == 0) {
      const char* plate = doc["plate"] | "";
      strncpy(pendingPlate, plate, sizeof(pendingPlate) - 1);
      pendingPlate[sizeof(pendingPlate) - 1] = 0;
      openRequested = true;
      Serial.printf("[mqtt] Lệnh MỞ cổng ra, biển %s\n", pendingPlate);
    }
  } else if (strcmp(topic, TOPIC_AUDIO) == 0) {
    const char* url = doc["url"] | "";
    if (url[0]) {
      Serial.printf("[mqtt] Phát audio: %s\n", url);
      requestPlay(url);
    }
  }
}

void mqttReconnect() {
  if (mqtt.connected() || millis() - lastMqttReconnect < 5000) return;
  lastMqttReconnect = millis();
  Serial.print("[mqtt] Đang nối broker... ");
  String cid = String("esp32-gate-") + GATE_ID + "-" + String((uint32_t)ESP.getEfuseMac(), HEX);
  if (mqtt.connect(cid.c_str(), MQTT_USER, MQTT_PASS,
                   TOPIC_STATUS, 1, true, "{\"event\":\"offline\",\"gate\":\"" GATE_ID "\"}")) {
    Serial.println("OK");
    mqtt.subscribe(TOPIC_CMD, 1);
    mqtt.subscribe(TOPIC_AUDIO, 1);
    publishStatus("online");
  } else {
    Serial.printf("thất bại rc=%d\n", mqtt.state());
  }
}

void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("[wifi] Đang nối");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) {
    delay(300);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED)
    Serial.printf("\n[wifi] OK, IP %s\n", WiFi.localIP().toString().c_str());
  else
    Serial.println("\n[wifi] CHƯA nối được (sẽ thử lại trong loop).");
}

// --------------------------------------------------------------------------
// Servo (tự chuyển state khi mở/đóng xong, như bản gốc)
// --------------------------------------------------------------------------
void updateServo() {
  if (millis() - lastServoMoveTime >= SERVO_MOVE_DELAY) {
    lastServoMoveTime = millis();
    int targetAngle = (currentState == STATE_IDLE_CLOSED || currentState == STATE_CLOSING)
                          ? ANGLE_CLOSED : ANGLE_OPEN;
    if (currentServoAngle < targetAngle) {
      currentServoAngle++;
      gateServo.write(currentServoAngle);
    } else if (currentServoAngle > targetAngle) {
      currentServoAngle--;
      gateServo.write(currentServoAngle);
    }
    if (currentState == STATE_OPENING && currentServoAngle == ANGLE_OPEN) {
      publishStatus("opened");
      changeState(STATE_WAIT_CAR_PASS, "Moi xe ra...");
    }
    if (currentState == STATE_CLOSING && currentServoAngle == ANGLE_CLOSED) {
      publishStatus("closed");
      changeState(STATE_IDLE_CLOSED, "Cho lenh MQTT");
    }
  }
}

void setup() {
  Serial.begin(115200);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("He thong GateOut");

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50);
  gateServo.attach(SERVO_PIN, 500, 2400);
  gateServo.write(ANGLE_CLOSED);
  currentServoAngle = ANGLE_CLOSED;

  setupI2S();
  audioQueue = xQueueCreate(4, sizeof(AudioCmd));
  xTaskCreatePinnedToCore(audioTask, "AudioTask", 8192, NULL, 1, NULL, 0);

  pinMode(IR_PIN, INPUT);
  pinMode(IR_WAIT_1, INPUT);
  pinMode(IR_WAIT_2, INPUT);
  pinMode(IR_WAIT_3, INPUT);
  pinMode(IR_WAIT_4, INPUT);

  setupWiFi();
#if MQTT_USE_TLS
  netClient.setInsecure();
#endif
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setBufferSize(512);
  mqtt.setCallback(onMqttMessage);

  changeState(STATE_IDLE_CLOSED, "Cho lenh MQTT");
  Serial.println("GateOut READY — cho lenh mo cong qua MQTT.");
}

void loop() {
  static unsigned long lastLCDUpdateTime = 0;
  static bool carDetectedAtGate = false;

  if (WiFi.status() == WL_CONNECTED) {
    mqttReconnect();
    mqtt.loop();
  }

  if (millis() - lastLCDUpdateTime >= 200) {
    lastLCDUpdateTime = millis();
    updateDisplay(currentLine2Msg);
  }

  updateServo();

  switch (currentState) {
    case STATE_IDLE_CLOSED:
      // Chỉ mở khi có lệnh MQTT (bỏ auto-5s).
      if (openRequested) {
        openRequested = false;
        Serial.println("-> Nhan lenh MQTT, mo cong ra!");
        requestBeep();
        publishStatus("opening");
        changeState(STATE_OPENING, "Dang mo...");
      }
      break;

    case STATE_OPENING:
      break;  // updateServo() lo, tự sang WAIT_CAR_PASS

    case STATE_WAIT_CAR_PASS:
      if (!carDetectedAtGate && digitalRead(IR_PIN) == IR_CAR_PRESENT) {
        carDetectedAtGate = true;
        currentLine2Msg = "Xe dang qua...";
        updateDisplay(currentLine2Msg);
        publishStatus("car_passing");
        Serial.println("-> Xe dang qua cong.");
      }
      if (carDetectedAtGate && digitalRead(IR_PIN) == IR_NO_CAR) {
        carDetectedAtGate = false;
        changeState(STATE_SAFE_DELAY, "An toan...");
        Serial.println("-> Xe da qua khoi cong.");
      }
      break;

    case STATE_SAFE_DELAY:
      if (millis() - stateStartTime >= 1000) {
        changeState(STATE_CLOSING, "Dang dong...");
        Serial.println("-> Dang dong cong.");
      }
      break;

    case STATE_CLOSING:
      break;  // updateServo() lo, tự sang IDLE_CLOSED
  }
}
