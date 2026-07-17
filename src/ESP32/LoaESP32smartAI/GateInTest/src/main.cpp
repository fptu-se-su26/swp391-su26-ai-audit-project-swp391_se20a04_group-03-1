// =============================================================================
// CỔNG VÀO (GateIn) — ESP32
//
// Điều khiển cổng + phát thông báo giọng nói, KẾT NỐI QUA MQTT.
//
// Kiến trúc (xem docs/mqtt_setup.md):
//   backend (cloud) --MQTT[smartparking/gate/in/cmd]--> ESP32 mở cổng + bíp
//   Pi 5 (Piper)    --MQTT[smartparking/gate/in/audio]-> ESP32 stream WAV -> loa MAX98357A
//   ESP32           --MQTT[smartparking/gate/in/status]-> báo sự kiện (mở/đóng/cháy...)
//
// KHÁC firmware cũ: BỎ hẳn kiểu "cứ 5 giây tự mở". Cổng chỉ mở khi có lệnh MQTT thật.
// Cảm biến cháy vẫn mở cổng khẩn cấp KỂ CẢ khi mất mạng (an toàn không phụ thuộc network).
//
// Âm thanh chạy trên 1 task riêng (core 0) và là NƠI DUY NHẤT ghi I2S -> tránh 2 luồng
// cùng đẩy loa. Vòng lặp chính (core 1) chỉ gửi lệnh BEEP / PLAY vào hàng đợi.
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
#define WIFI_SSID   "TEN_WIFI"
#define WIFI_PASS   "MAT_KHAU_WIFI"

// Broker MQTT cloud (ví dụ HiveMQ Cloud). TLS = cổng 8883.
#define MQTT_HOST   "xxxxxxxx.s1.eu.hivemq.cloud"
#define MQTT_PORT   8883
#define MQTT_USER   "esp32gate"
#define MQTT_PASS   "MAT_KHAU_MQTT"
#define MQTT_USE_TLS 1        // 1 = TLS(8883); 0 = trần(1883) chỉ để test broker LAN

// Định danh cổng. Toàn bộ topic sinh ra từ đây — file cổng RA chỉ khác đúng dòng này.
#define GATE_ID     "in"

#define TOPIC_CMD    "smartparking/gate/" GATE_ID "/cmd"
#define TOPIC_AUDIO  "smartparking/gate/" GATE_ID "/audio"
#define TOPIC_STATUS "smartparking/gate/" GATE_ID "/status"

// ===== CHÂN & GÓC SERVO =====
#define SERVO_PIN 33
#define ANGLE_CLOSED 180
#define ANGLE_OPEN 90

// ===== I2S (module khuếch đại MAX98357A) =====
#define I2S_BCLK 26
#define I2S_LRC 25
#define I2S_DOUT 27
#define I2S_DEFAULT_RATE 22050   // Piper vais1000-medium; sẽ chỉnh lại theo header WAV

#define IR_PIN 32                // cảm biến hồng ngoại dưới cổng

#define LED1_PIN 13 //Box 1
#define LED2_PIN 12 //Box 2
#define LED3_PIN 14 //Box 3

#define FIRE_SENSOR_PIN 34
#define BUZZER_PIN 4
#define FIRE_DETECTED LOW

#define IR_CAR_PRESENT LOW
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
  STATE_WAITING_CAR,
  STATE_CAR_PASSING,
  STATE_CLOSING,
  STATE_FIRE_EMERGENCY
};

GateState currentState = STATE_IDLE_CLOSED;
unsigned long stateStartTime = 0;
unsigned long lastServoMoveTime = 0;
unsigned long lastLedBlinkTime = 0;

int currentServoAngle = ANGLE_CLOSED;
int targetServoAngle = ANGLE_CLOSED;

bool ledBlinkState = false;
int blinkCount = 0;

// Cờ đặt bởi callback MQTT, tiêu thụ ở STATE_IDLE_CLOSED.
volatile bool openRequested = false;
char pendingPlate[16] = "";

unsigned long lastMqttReconnect = 0;

// ===== HÀNG ĐỢI ÂM THANH (main -> audio task) =====
enum AudioType { AUDIO_BEEP, AUDIO_PLAY_URL };
struct AudioCmd {
  AudioType type;
  char url[200];
};
QueueHandle_t audioQueue;

// --------------------------------------------------------------------------
// LCD & LED
// --------------------------------------------------------------------------
void set3LEDs(int state) {
  digitalWrite(LED1_PIN, state);
  digitalWrite(LED2_PIN, state);
  digitalWrite(LED3_PIN, state);
}

void updateLCD(const char* line1, const char* line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  if (line2 != nullptr) {
    lcd.setCursor(0, 1);
    lcd.print(line2);
  }
}

void changeState(GateState newState) {
  currentState = newState;
  stateStartTime = millis();
}

// --------------------------------------------------------------------------
// I2S — cấu hình 1 lần; chỉ audio task được ghi vào I2S
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

// --------------------------------------------------------------------------
// Âm thanh: bíp cảnh báo + stream WAV qua HTTP LAN từ Pi
// --------------------------------------------------------------------------
void playBeep(int times) {
  const int sr = I2S_DEFAULT_RATE;
  i2s_set_sample_rate(I2S_NUM_0, sr);
  const int n = sr * 120 / 1000;    // 120ms mỗi tiếng
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

// Đọc đúng n byte từ stream, có timeout. Trả false nếu hết giờ / đứt kết nối.
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

// Bỏ qua n byte của stream.
bool skipBytes(WiFiClient* stream, uint32_t n) {
  uint8_t tmp[64];
  while (n > 0) {
    size_t want = n < sizeof(tmp) ? n : sizeof(tmp);
    if (!readExact(stream, tmp, want)) return false;
    n -= want;
  }
  return true;
}

// Đọc uint32 little-endian
static inline uint32_t le32(const uint8_t* p) {
  return (uint32_t)p[0] | ((uint32_t)p[1] << 8) | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24);
}

// Tải WAV từ url (HTTP LAN, không TLS) rồi đẩy PCM ra I2S.
// Tự đọc sample rate / bits / channels từ header (duyệt chunk) để không phụ thuộc format cứng.
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
    Serial.println("[audio] Không phải file WAV hợp lệ");
    http.end();
    return;
  }

  uint32_t sampleRate = I2S_DEFAULT_RATE;
  uint16_t bits = 16, channels = 1;

  // Duyệt các chunk cho tới "data".
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
      // MAX98357A mono; Piper xuất mono 16-bit nên đẩy thẳng. (Nếu về sau đổi sang
      // stereo/8-bit thì cần downmix ở đây — hiện không cần.)
      i2s_set_sample_rate(I2S_NUM_0, sampleRate);

      static uint8_t buf[1024];
      uint32_t remaining = sz;
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
        size_t want = remaining < sizeof(buf) ? remaining : sizeof(buf);
        int r = stream->read(buf, want < (size_t)a ? want : (size_t)a);
        if (r > 0) {
          i2s_write(I2S_NUM_0, buf, r, &bw, portMAX_DELAY);
          remaining -= r;
          last = millis();
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
  char buf[128];
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
      Serial.printf("[mqtt] Lệnh MỞ cổng, biển %s\n", pendingPlate);
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
  // LWT: nếu ESP32 rớt, broker tự báo offline (retained) cho backend biết.
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
    Serial.println("\n[wifi] CHƯA nối được (sẽ thử lại trong loop). Cổng vẫn chạy cảm biến cháy.");
}

// --------------------------------------------------------------------------
// Servo
// --------------------------------------------------------------------------
void updateServo() {
  if (currentServoAngle != targetServoAngle) {
    if (millis() - lastServoMoveTime >= 15) {
      lastServoMoveTime = millis();
      currentServoAngle += (currentServoAngle < targetServoAngle) ? 1 : -1;
      gateServo.write(currentServoAngle);
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);
  set3LEDs(LOW);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  updateLCD("He thong GateIn", "Khoi tao...");

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50);
  gateServo.attach(SERVO_PIN, 500, 2400);
  gateServo.write(ANGLE_CLOSED);
  currentServoAngle = ANGLE_CLOSED;
  targetServoAngle = ANGLE_CLOSED;

  setupI2S();
  audioQueue = xQueueCreate(4, sizeof(AudioCmd));
  xTaskCreatePinnedToCore(audioTask, "AudioTask", 8192, NULL, 1, NULL, 0);

  pinMode(IR_PIN, INPUT);
  pinMode(FIRE_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  setupWiFi();
#if MQTT_USE_TLS
  netClient.setInsecure();     // demo: bỏ kiểm cert. Muốn chặt hơn thì nạp root CA bằng setCACert().
#endif
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setBufferSize(512);
  mqtt.setCallback(onMqttMessage);

  updateLCD("Dong cong.", "Cho lenh MQTT");
  Serial.println("GateIn READY — cho lenh mo cong qua MQTT.");
  changeState(STATE_IDLE_CLOSED);
}

void loop() {
  // Mạng: giữ WiFi + MQTT sống. Không chặn vòng lặp cổng nếu mạng chập chờn.
  if (WiFi.status() == WL_CONNECTED) {
    mqttReconnect();
    mqtt.loop();
  }

  unsigned long currentTime = millis();
  unsigned long timeInState = currentTime - stateStartTime;

  // --- 1. ƯU TIÊN CAO NHẤT: BÁO CHÁY (hoạt động cả khi mất mạng) ---
  if (digitalRead(FIRE_SENSOR_PIN) == FIRE_DETECTED) {
    if (currentState != STATE_FIRE_EMERGENCY) {
      Serial.println("!!! PHAT HIEN CHAY !!! MO CONG KHAN CAP !!!");
      digitalWrite(BUZZER_PIN, HIGH);
      set3LEDs(HIGH);
      targetServoAngle = ANGLE_OPEN;
      updateLCD("!!! CANH BAO !!!", "PHAT HIEN CHAY");
      publishStatus("fire");
      changeState(STATE_FIRE_EMERGENCY);
    }
  } else if (currentState == STATE_FIRE_EMERGENCY) {
    Serial.println("-> Da het chay. Khac phuc.");
    digitalWrite(BUZZER_PIN, LOW);
    set3LEDs(LOW);
    targetServoAngle = ANGLE_CLOSED;
    updateLCD("Dong cong an toan", "Cho lenh MQTT");
    publishStatus("fire_cleared");
    openRequested = false;
    changeState(STATE_IDLE_CLOSED);
  }

  // --- 2. SERVO ---
  updateServo();

  // --- 3. STATE MACHINE ---
  switch (currentState) {

    case STATE_IDLE_CLOSED:
      // KHÔNG còn tự mở sau 5s. Chỉ mở khi backend gửi lệnh MQTT.
      if (openRequested) {
        openRequested = false;
        Serial.println("-> Nhan lenh MQTT, mo cong!");
        targetServoAngle = ANGLE_OPEN;
        set3LEDs(HIGH);
        char l2[17];
        snprintf(l2, sizeof(l2), "Xe %s", pendingPlate[0] ? pendingPlate : "vao");
        updateLCD("Mo cong...", l2);
        requestBeep();
        publishStatus("opening");
        changeState(STATE_OPENING);
      }
      break;

    case STATE_OPENING:
      if (currentServoAngle == targetServoAngle) {
        Serial.println("-> Cong da mo. Cho xe.");
        updateLCD("Da mo cong", "Moi xe qua...");
        publishStatus("opened");
        changeState(STATE_WAITING_CAR);
      }
      break;

    case STATE_WAITING_CAR:
      if (digitalRead(IR_PIN) == IR_CAR_PRESENT) {
        Serial.println("-> Phat hien xe dang qua.");
        updateLCD("Xe dang qua...", nullptr);
        publishStatus("car_passing");
        changeState(STATE_CAR_PASSING);
      } else if (timeInState >= 15000) {
        // Timeout an toàn: mở 15s không có xe -> đóng lại.
        Serial.println("-> Timeout khong co xe. Dong cong.");
        updateLCD("Het han cho", "Tu dong dong...");
        targetServoAngle = ANGLE_CLOSED;
        blinkCount = 0;
        lastLedBlinkTime = currentTime;
        changeState(STATE_CLOSING);
      }
      break;

    case STATE_CAR_PASSING:
      if (digitalRead(IR_PIN) == IR_NO_CAR) {
        if (timeInState >= 1000) {   // debounce 1s sau khi IR nhả
          Serial.println("-> Xe da qua. Dong cong.");
          updateLCD("Xe da qua", "Dong cong...");
          targetServoAngle = ANGLE_CLOSED;
          blinkCount = 0;
          lastLedBlinkTime = currentTime;
          ledBlinkState = false;
          changeState(STATE_CLOSING);
        }
      } else {
        stateStartTime = currentTime;  // xe còn che IR -> reset debounce
      }
      break;

    case STATE_CLOSING:
      // Chống kẹt: có vật cản khi đang đóng -> mở lại ngay.
      if (digitalRead(IR_PIN) == IR_CAR_PRESENT) {
        Serial.println("-> VAT CAN! Mo lai cong.");
        targetServoAngle = ANGLE_OPEN;
        set3LEDs(HIGH);
        updateLCD("!!! VAT CAN !!!", "Mo lai cong");
        publishStatus("obstacle");
        changeState(STATE_OPENING);
        break;
      }
      if (blinkCount < 6) {
        if (currentTime - lastLedBlinkTime >= 250) {
          ledBlinkState = !ledBlinkState;
          set3LEDs(ledBlinkState ? HIGH : LOW);
          lastLedBlinkTime = currentTime;
          blinkCount++;
        }
      } else {
        set3LEDs(LOW);
      }
      if (currentServoAngle == targetServoAngle) {
        Serial.println("-> Dong cong xong.");
        updateLCD("Dong cong.", "Cho lenh MQTT");
        publishStatus("closed");
        changeState(STATE_IDLE_CLOSED);
      }
      break;

    case STATE_FIRE_EMERGENCY:
      break;  // giữ cổng mở + còi tới khi hết cháy (xử lý ở mục 1)
  }
}
