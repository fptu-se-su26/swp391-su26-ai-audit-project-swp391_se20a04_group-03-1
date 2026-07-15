#include <Arduino.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <driver/i2s.h>
#include <math.h>

// --- ĐỊNH NGHĨA CHÂN VÀ GÓC SERVO ---
#define SERVO_PIN 33
// Tinh chỉnh 2 thông số này để bù trừ góc lệch của Servo
#define ANGLE_CLOSED 0 // Góc đóng cổng
#define ANGLE_OPEN 90  // Góc mở cổng

#define I2S_BCLK 26
#define I2S_LRC 25
#define I2S_DOUT 27

#define IR_PIN 32 // Cảm biến đặt PHÍA SAU cổng để nhận biết xe đã ra ngoài -> Đóng cổng

// --- CẢM BIẾN ĐẾM XE CHỜ ---
#define IR_WAIT_1 19
#define IR_WAIT_2 18
#define IR_WAIT_3 17
#define IR_WAIT_4 16

// --- ĐỊNH NGHĨA TRẠNG THÁI CẢM BIẾN ---
#define IR_CAR_PRESENT LOW // CÓ xe cản tia
#define IR_NO_CAR HIGH     // KHÔNG CÓ xe

// --- KHỞI TẠO ĐỐI TƯỢNG ---
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo gateServo;

// --- STATE MACHINE CỔNG ---
enum GateState {
  STATE_IDLE_CLOSED,   // Cổng đang đóng, chờ 5s để tự mở
  STATE_OPENING,       // Đang quay Servo mở ra
  STATE_WAIT_CAR_PASS, // Cổng đã mở, chờ xe đi qua cảm biến IR_PIN phía sau
  STATE_SAFE_DELAY,    // Xe đã qua cảm biến, chờ 1 giây an toàn
  STATE_CLOSING        // Đang quay Servo đóng lại
};

GateState currentState = STATE_IDLE_CLOSED;
unsigned long stateStartTime = 0;
const char* currentLine2Msg = "Cho 5s de mo...";

// --- BIẾN ĐIỀU KHIỂN SERVO ---
int currentServoAngle = ANGLE_CLOSED;
unsigned long lastServoMoveTime = 0;
const int SERVO_MOVE_DELAY = 15; // ms per degree

// --- I2S AUDIO TASK ---
enum AudioMode {
  AUDIO_NONE,
  AUDIO_BEEP_3
};

volatile AudioMode currentAudioMode = AUDIO_NONE;
TaskHandle_t audioTaskHandle = NULL;

// --- HÀM ĐẾM XE CHỜ ---
int getWaitingCars() {
  int count = 0;
  if (digitalRead(IR_WAIT_1) == IR_CAR_PRESENT) count++;
  if (digitalRead(IR_WAIT_2) == IR_CAR_PRESENT) count++;
  if (digitalRead(IR_WAIT_3) == IR_CAR_PRESENT) count++;
  if (digitalRead(IR_WAIT_4) == IR_CAR_PRESENT) count++;
  return count;
}

// --- HÀM CẬP NHẬT MÀN HÌNH LCD ---
void updateDisplay(const char *line2) {
  int count = getWaitingCars();
  
  char buf1[17];
  snprintf(buf1, 17, "Goc:%2d|Cho:%dxe  ", currentServoAngle, count);
  
  char buf2[17];
  snprintf(buf2, 17, "%-16s", line2); // Pad with spaces to 16 chars để tự ghi đè
  
  lcd.setCursor(0, 0);
  lcd.print(buf1);
  lcd.setCursor(0, 1);
  lcd.print(buf2);
}

// --- HÀM CHUYỂN TRẠNG THÁI ---
void changeState(GateState newState, const char* msg) {
  if (currentState != newState) {
    currentState = newState;
    stateStartTime = millis();
    currentLine2Msg = msg;
    updateDisplay(currentLine2Msg); 
  }
}

// --- HÀM CẤU HÌNH I2S CHO MODULE MAX98357A ---
void setupI2S() {
  i2s_config_t i2s_config = {
      .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
      .sample_rate = 44100,
      .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
      .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
      .communication_format = I2S_COMM_FORMAT_STAND_I2S,
      .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
      .dma_buf_count = 8,
      .dma_buf_len = 64,
      .use_apll = false,
      .tx_desc_auto_clear = true,
      .fixed_mclk = 0};

  i2s_pin_config_t pin_config = {
      .bck_io_num = I2S_BCLK,
      .ws_io_num = I2S_LRC,
      .data_out_num = I2S_DOUT,
      .data_in_num = I2S_PIN_NO_CHANGE};

  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pin_config);
}

// --- TASK XỬ LÝ ÂM THANH NON-BLOCKING ---
void audioTask(void * pvParameters) {
  int sample_rate = 44100;
  int16_t sample;
  size_t bytes_written;

  for(;;) {
    if (currentAudioMode == AUDIO_BEEP_3) {
      for (int i = 0; i < 3 && currentAudioMode == AUDIO_BEEP_3; i++) {
        int num_samples = (sample_rate * 150) / 1000;
        for (int j = 0; j < num_samples && currentAudioMode == AUDIO_BEEP_3; j++) {
          sample = (int16_t)(10000.0 * sin(2.0 * M_PI * 1200.0 * j / sample_rate));
          i2s_write(I2S_NUM_0, &sample, sizeof(sample), &bytes_written, portMAX_DELAY);
        }
        i2s_zero_dma_buffer(I2S_NUM_0);
        vTaskDelay(100 / portTICK_PERIOD_MS);
      }
      if (currentAudioMode == AUDIO_BEEP_3) currentAudioMode = AUDIO_NONE;
    } else {
      vTaskDelay(50 / portTICK_PERIOD_MS);
    }
  }
}

// --- HÀM CẬP NHẬT SERVO NON-BLOCKING ---
void updateServo() {
  if (millis() - lastServoMoveTime >= SERVO_MOVE_DELAY) {
    lastServoMoveTime = millis();
    int targetAngle = (currentState == STATE_IDLE_CLOSED || currentState == STATE_CLOSING) ? ANGLE_CLOSED : ANGLE_OPEN;
    
    if (currentServoAngle < targetAngle) {
      currentServoAngle++;
      gateServo.write(currentServoAngle);
    } else if (currentServoAngle > targetAngle) {
      currentServoAngle--;
      gateServo.write(currentServoAngle);
    }
    
    // Chuyển state sau khi servo mở xong
    if (currentState == STATE_OPENING && currentServoAngle == ANGLE_OPEN) {
        changeState(STATE_WAIT_CAR_PASS, "Moi xe ra...");
    }
    // Chuyển state sau khi servo đóng xong
    if (currentState == STATE_CLOSING && currentServoAngle == ANGLE_CLOSED) {
        changeState(STATE_IDLE_CLOSED, "Cho 5s de mo...");
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
  delay(1000);

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50);
  gateServo.attach(SERVO_PIN, 500, 2400);
  gateServo.write(ANGLE_CLOSED);
  currentServoAngle = ANGLE_CLOSED;

  setupI2S();
  xTaskCreatePinnedToCore(audioTask, "AudioTask", 4096, NULL, 1, &audioTaskHandle, 0);

  pinMode(IR_PIN, INPUT);
  pinMode(IR_WAIT_1, INPUT);
  pinMode(IR_WAIT_2, INPUT);
  pinMode(IR_WAIT_3, INPUT);
  pinMode(IR_WAIT_4, INPUT);

  // Mới khởi động: Cổng đóng, chờ 5s mở
  changeState(STATE_IDLE_CLOSED, "Cho 5s de mo...");
  Serial.println("GateOut 02 Ready! Cho 5s de mo cong...");
}

void loop() {
  static unsigned long lastLCDUpdateTime = 0;

  // Cập nhật LCD định kỳ (200ms) để theo dõi số xe đang chờ
  if (millis() - lastLCDUpdateTime >= 200) {
    lastLCDUpdateTime = millis();
    updateDisplay(currentLine2Msg);
  }

  // --- CẬP NHẬT SERVO ---
  updateServo();

  // --- MÁY TRẠNG THÁI (STATE MACHINE) ---
  static bool carDetectedAtGate = false;

  switch (currentState) {
    case STATE_IDLE_CLOSED:
      // Chờ đủ 5s sau khi đóng thì tự động mở
      if (millis() - stateStartTime >= 5000) {
        changeState(STATE_OPENING, "Dang mo...");
        currentAudioMode = AUDIO_BEEP_3; // Kêu 3 tiếng bíp khi bắt đầu mở
        Serial.println("-> Da du 5s, tu dong mo cong!");
      }
      break;

    case STATE_OPENING:
      // updateServo() đang xử lý, tự động chuyển sang STATE_WAIT_CAR_PASS khi mở xong.
      break;

    case STATE_WAIT_CAR_PASS:
      // Chờ xe đi ngang qua IR_PIN (phía sau cổng)
      if (!carDetectedAtGate && digitalRead(IR_PIN) == IR_CAR_PRESENT) {
          carDetectedAtGate = true;
          currentLine2Msg = "Xe dang qua..."; // Cập nhật ngay dòng chữ
          updateDisplay(currentLine2Msg);
          Serial.println("-> Phat hien xe dang qua cong...");
      }
      
      if (carDetectedAtGate && digitalRead(IR_PIN) == IR_NO_CAR) {
          // Xe đã qua hẳn IR_PIN
          carDetectedAtGate = false;
          changeState(STATE_SAFE_DELAY, "An toan...");
          Serial.println("-> Xe da qua khoi cong.");
      }
      // Không cần timeout nếu logic là cổng cứ giữ mở để chờ xe đi ra
      break;

    case STATE_SAFE_DELAY:
      // Chờ 1 giây an toàn sau khi xe đi qua hoàn toàn trước khi đóng
      if (millis() - stateStartTime >= 1000) {
        changeState(STATE_CLOSING, "Dang dong...");
        Serial.println("-> Dang dong cong.");
      }
      break;

    case STATE_CLOSING:
      // updateServo() đang xử lý, tự động chuyển sang STATE_IDLE_CLOSED khi đóng xong.
      break;
  }
}