#include <Arduino.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <driver/i2s.h>
#include <math.h>

// --- ĐỊNH NGHĨA CHÂN VÀ GÓC SERVO ---
#define SERVO_PIN 33
// Tinh chỉnh 2 thông số này để bù trừ góc lệch của Servo
#define ANGLE_CLOSED 180 // Góc đóng cổng
#define ANGLE_OPEN 90    // Góc mở cổng

#define I2S_BCLK 26
#define I2S_LRC 25
#define I2S_DOUT 27

#define IR_PIN 32 // Chân kết nối cảm biến hồng ngoại

// --- ĐỊNH NGHĨA CHÂN CHO 3 ĐÈN LED ---
#define LED1_PIN 13
#define LED2_PIN 12
#define LED3_PIN 14

// --- ĐỊNH NGHĨA CHÂN CHO BÁO CHÁY VÀ CÒI ---
#define FIRE_SENSOR_PIN 34 // Chân DO của cảm biến báo cháy
#define BUZZER_PIN 4       // Chân điều khiển còi MH-FMG
#define FIRE_DETECTED LOW  // Trạng thái khi phát hiện có lửa (cảm biến IR thường xuất LOW)

// --- ĐỊNH NGHĨA TRẠNG THÁI CẢM BIẾN ---
#define IR_CAR_PRESENT HIGH // Trạng thái khi CÓ xe cản tia hồng ngoại
#define IR_NO_CAR LOW       // Trạng thái khi KHÔNG CÓ xe

// --- KHỞI TẠO ĐỐI TƯỢNG ---
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo gateServo;

// --- STATE MACHINE ENUM ---
enum GateState {
  STATE_IDLE_CLOSED,
  STATE_OPENING,
  STATE_WAITING_CAR,
  STATE_CAR_PASSING,
  STATE_CLOSING,
  STATE_FIRE_EMERGENCY
};

// --- BIẾN TOÀN CỤC MỚI (NON-BLOCKING) ---
GateState currentState = STATE_IDLE_CLOSED;
GateState previousState = STATE_IDLE_CLOSED;

unsigned long stateStartTime = 0;
unsigned long lastServoMoveTime = 0;
unsigned long lastLedBlinkTime = 0;
unsigned long lastBeepTime = 0;

int currentServoAngle = ANGLE_CLOSED;
int targetServoAngle = ANGLE_CLOSED;

bool ledBlinkState = false;
int blinkCount = 0;
int beepCount = 0;

// --- HÀM HỖ TRỢ ---
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
  previousState = currentState;
  currentState = newState;
  stateStartTime = millis();
}

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

// Hàm này chạy mất khoảng 150ms do ghi vào I2S, 
// nhưng chỉ được gọi riêng lẻ nên không gây blocking nghiêm trọng.
void playTone(float freq, int duration_ms) {
  int sample_rate = 44100;
  int num_samples = (sample_rate * duration_ms) / 1000;
  int16_t sample;
  size_t bytes_written;

  for (int i = 0; i < num_samples; i++) {
    sample = (int16_t)(10000.0 * sin(2.0 * M_PI * freq * i / sample_rate));
    i2s_write(I2S_NUM_0, &sample, sizeof(sample), &bytes_written, 10 / portTICK_PERIOD_MS);
  }
  i2s_zero_dma_buffer(I2S_NUM_0);
}

// Hàm điều khiển Servo mượt mà, gọi liên tục trong loop, không dùng delay()
void updateServo() {
  if (currentServoAngle != targetServoAngle) {
    if (millis() - lastServoMoveTime >= 15) { // 15ms cho 1 độ quay
      lastServoMoveTime = millis();
      if (currentServoAngle < targetServoAngle) {
        currentServoAngle++;
      } else {
        currentServoAngle--;
      }
      gateServo.write(currentServoAngle);
    }
  }
}

void setup() {
  Serial.begin(115200);

  // 1. Đèn LED
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);
  set3LEDs(LOW); 

  // 2. Màn hình LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  updateLCD("He thong GateIn", "Khoi tao...");
  delay(1000); 

  // 3. Servo
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50);
  gateServo.attach(SERVO_PIN, 500, 2400);
  gateServo.write(ANGLE_CLOSED);
  currentServoAngle = ANGLE_CLOSED;
  targetServoAngle = ANGLE_CLOSED;

  // 4. Loa (I2S)
  setupI2S();

  // 5. Cảm biến
  pinMode(IR_PIN, INPUT);
  pinMode(FIRE_SENSOR_PIN, INPUT);
  
  // 6. Còi
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW); 

  // 7. Hoàn tất setup, vào trạng thái Idle
  char buf[16];
  sprintf(buf, "Goc: %d", ANGLE_CLOSED);
  updateLCD("Dong cong.", buf);
  Serial.println("GateIn Test Ready! Cho mo cong...");
  
  changeState(STATE_IDLE_CLOSED);
}

void loop() {
  unsigned long currentTime = millis();
  unsigned long timeInState = currentTime - stateStartTime;

  // --- 1. ƯU TIÊN CAO NHẤT: KIỂM TRA BÁO CHÁY ---
  // Luôn kiểm tra cảm biến cháy, không bị chặn bởi bất kỳ vòng lặp nào
  if (digitalRead(FIRE_SENSOR_PIN) == FIRE_DETECTED) {
    if (currentState != STATE_FIRE_EMERGENCY) {
      Serial.println("!!! PHAT HIEN CHAY !!! COI BAO DONG KICH HOAT !!!");
      digitalWrite(BUZZER_PIN, HIGH); // Bật còi MH-FMG
      set3LEDs(HIGH);                 // Bật full đèn
      targetServoAngle = ANGLE_OPEN;  // MỞ CỔNG KHẨN CẤP
      updateLCD("!!! CANH BAO !!!", "PHAT HIEN CHAY");
      changeState(STATE_FIRE_EMERGENCY);
    }
  } 
  else if (currentState == STATE_FIRE_EMERGENCY) {
    // Nếu lửa đã tắt và đang ở trạng thái cấp cứu -> Khôi phục
    Serial.println("-> Da tat ngon lua. Khac phuc su co.");
    digitalWrite(BUZZER_PIN, LOW);
    set3LEDs(LOW);
    targetServoAngle = ANGLE_CLOSED; // Đóng lại cho an toàn
    char buf[16];
    sprintf(buf, "Goc: %d", ANGLE_CLOSED);
    updateLCD("Dong cong an toan", buf);
    changeState(STATE_IDLE_CLOSED);
  }

  // --- 2. CẬP NHẬT GÓC SERVO LIÊN TỤC ---
  updateServo();

  // --- 3. XỬ LÝ THEO TRẠNG THÁI (STATE MACHINE) ---
  switch (currentState) {
    
    case STATE_IDLE_CLOSED:
      // Mô phỏng tự động mở cửa sau 5 giây (như code gốc yêu cầu)
      if (timeInState >= 5000) {
        Serial.println("-> Da du 5s, tu dong mo cong!");
        targetServoAngle = ANGLE_OPEN;
        set3LEDs(HIGH); // Bật sáng 3 đèn
        updateLCD("Mo cong...", "Moi xe vao");
        beepCount = 0;
        lastBeepTime = currentTime;
        changeState(STATE_OPENING);
      }
      break;

    case STATE_OPENING:
      // Phát tiếng bíp cảnh báo (3 lần) khi đang mở cổng, cách nhau 250ms
      if (beepCount < 3 && (currentTime - lastBeepTime >= 250)) {
        playTone(1200.0, 150);
        lastBeepTime = currentTime;
        beepCount++;
      }

      // Đợi cửa mở xong hẳn
      if (currentServoAngle == targetServoAngle && beepCount >= 3) {
        Serial.println("-> Cong da mo. Cho xe.");
        updateLCD("Da mo cong", "Moi xe qua...");
        changeState(STATE_WAITING_CAR);
      }
      break;

    case STATE_WAITING_CAR:
      // Chờ xe đi qua
      if (digitalRead(IR_PIN) == IR_CAR_PRESENT) {
        Serial.println("-> Phat hien xe. Van giu cong...");
        char buf[16];
        sprintf(buf, "Goc servo: %d", ANGLE_OPEN);
        updateLCD("Xe dang qua...", buf);
        changeState(STATE_CAR_PASSING);
      } 
      // TIMEOUT AN TOÀN: Nếu mở 10s không có xe nào qua thì tự động đóng lại
      else if (timeInState >= 10000) {
        Serial.println("-> Timeout khong co xe. Dong cong.");
        updateLCD("Het han cho", "Tu dong dong...");
        targetServoAngle = ANGLE_CLOSED;
        blinkCount = 0;
        lastLedBlinkTime = currentTime;
        changeState(STATE_CLOSING);
      }
      break;

    case STATE_CAR_PASSING:
      // Chờ xe đi qua hẳn
      if (digitalRead(IR_PIN) == IR_NO_CAR) {
        // Đợi thêm 1 giây an toàn sau khi IR clear (Debounce)
        if (timeInState >= 1000) {
          Serial.println("-> Xe da qua khoi. Chuan bi dong cong...");
          updateLCD("Xe da qua", "Dong cong...");
          targetServoAngle = ANGLE_CLOSED;
          blinkCount = 0;
          lastLedBlinkTime = currentTime;
          ledBlinkState = false;
          changeState(STATE_CLOSING);
        }
      } else {
        // Nếu xe vẫn đang che hồng ngoại thì liên tục reset thời gian state
        stateStartTime = currentTime;
      }
      break;

    case STATE_CLOSING:
      // ANTI-PINCH (Chống kẹt): 
      // Nếu có người/xe đi vào vùng hồng ngoại trong lúc cổng ĐANG ĐÓNG!
      if (digitalRead(IR_PIN) == IR_CAR_PRESENT) {
        Serial.println("-> VAT CAN! Hủy dong cong, mo lai ngay lap tuc!");
        targetServoAngle = ANGLE_OPEN;
        set3LEDs(HIGH);
        updateLCD("!!! VAT CAN !!!", "Mo lai cong");
        changeState(STATE_OPENING);
        beepCount = 3; // Không beep lại quá nhiều
        break; // Thoát case đóng
      }

      // Xử lý nháy đèn cảnh báo khi đóng (3 lần sáng/tắt = 6 lần đổi trạng thái)
      if (blinkCount < 6) {
        if (currentTime - lastLedBlinkTime >= 250) {
          ledBlinkState = !ledBlinkState;
          set3LEDs(ledBlinkState ? HIGH : LOW);
          lastLedBlinkTime = currentTime;
          blinkCount++;
        }
      } else {
        set3LEDs(LOW); // Nháy xong thì tắt đèn
      }

      // Đã đóng xong
      if (currentServoAngle == targetServoAngle) {
        Serial.println("-> Dong cong thanh cong.");
        char buf[16];
        sprintf(buf, "Goc: %d", ANGLE_CLOSED);
        updateLCD("Dong cong.", buf);
        changeState(STATE_IDLE_CLOSED);
      }
      break;

    case STATE_FIRE_EMERGENCY:
      // Trong trường hợp hỏa hoạn:
      // - Còi MH-FMG hú liên tục (do digitalWrite BUZZER_PIN HIGH ở đầu)
      // - Servo đã quay tới góc OPEN để sơ tán
      // Hàm updateServo() vẫn chạy để đảm bảo góc quay tới đích an toàn
      // - Đợi đến khi hết lửa sẽ xử lý ở bước (1. ƯU TIÊN CAO NHẤT)
      break;
  }
}