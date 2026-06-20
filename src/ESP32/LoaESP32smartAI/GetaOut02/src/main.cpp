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
#define ANGLE_OPEN   90  // Góc mở cổng

#define I2S_BCLK 26
#define I2S_LRC 25
#define I2S_DOUT 27

#define IR_PIN 32 // Chân kết nối cảm biến hồng ngoại

// --- ĐỊNH NGHĨA TRẠNG THÁI CẢM BIẾN ---
// CHÚ Ý: Cảm biến hồng ngoại (IR) phổ biến (như FC-51) thường xuất mức LOW khi CÓ vật cản.
// Tuy nhiên theo comment cũ, mã đang để HIGH = Có xe. 
// NẾU BẠN THẤY CỔNG MỞ RỒI ĐÓNG LẠI NGAY LẬP TỨC KHI KHÔNG CÓ XE, HÃY ĐẢO NGƯỢC 2 GIÁ TRỊ DƯỚI ĐÂY:
#define IR_CAR_PRESENT HIGH  // Trạng thái khi CÓ xe cản tia hồng ngoại
#define IR_NO_CAR      LOW   // Trạng thái khi KHÔNG CÓ xe

// --- KHỞI TẠO ĐỐI TƯỢNG ---
LiquidCrystal_I2C lcd(0x27, 16, 2); 
Servo gateServo;

// --- BIẾN TRẠNG THÁI ---
unsigned long lastCloseTime = 0;
bool isGateOpen = false;

// --- HÀM CẤU HÌNH I2S CHO MODULE MAX98357A ---
void setupI2S() {
  i2s_config_t i2s_config = {.mode =
                                 (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
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

  i2s_pin_config_t pin_config = {.bck_io_num = I2S_BCLK,
                                 .ws_io_num = I2S_LRC,
                                 .data_out_num = I2S_DOUT,
                                 .data_in_num = I2S_PIN_NO_CHANGE};

  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pin_config);
}

// --- HÀM TẠO ÂM THANH QUA I2S ---
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

// --- HÀM ĐIỀU KHIỂN SERVO (MƯỢT NHẤT, KHÔNG DỪNG) ---
void moveServoSmoothly(int startAngle, int targetAngle) {
  int delayMs = 15;  // Dừng 15ms cho mỗi độ để quay mượt, liên tục, không bị khựng

  if (startAngle < targetAngle) {
    for (int angle = startAngle; angle <= targetAngle; angle++) {
      gateServo.write(angle);
      delay(delayMs);
    }
  } else if (startAngle > targetAngle) {
    for (int angle = startAngle; angle >= targetAngle; angle--) {
      gateServo.write(angle);
      delay(delayMs);
    }
  } else {
    gateServo.write(targetAngle);
  }
}

void setup() {
  Serial.begin(115200);

  // 1. Khởi tạo màn hình LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("He thong GateOut");
  delay(1000);

  // 2. Khởi tạo Servo
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50);
  gateServo.attach(SERVO_PIN, 500, 2400); 
  gateServo.write(ANGLE_CLOSED);

  // 3. Khởi tạo I2S cho loa
  setupI2S();

  // 4. Khởi tạo cảm biến hồng ngoại
  pinMode(IR_PIN, INPUT);

  // 5. Thiết lập trạng thái ban đầu
  isGateOpen = false;
  lastCloseTime = millis(); // Bắt đầu tính thời gian để mở cổng

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Dong cong.Goc:");
  lcd.print(ANGLE_CLOSED);
  lcd.setCursor(0, 1);
  lcd.print("Cho 5s de mo...");
  Serial.println("GateOut 02 Ready! Cho 5 giay de mo cong...");
}

void loop() {
  if (!isGateOpen) {
    // Nếu cổng đang đóng, kiểm tra xem đã đủ 5 giây chưa
    if (millis() - lastCloseTime >= 5000) {
      Serial.println("-> Da du 5s, mo cong!");
      
      // Mở cổng
      moveServoSmoothly(ANGLE_CLOSED, ANGLE_OPEN);
      isGateOpen = true;

      // Cập nhật LCD
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Mo cong. Goc:");
      lcd.print(ANGLE_OPEN);
      lcd.setCursor(0, 1);
      lcd.print("Moi xe ra...");

      // Phát âm thanh cảnh báo
      for (int i = 0; i < 3; i++) {
        playTone(1200.0, 150);
        delay(100);
        yield();
      }
      
      Serial.println("-> Dang cho xe di qua tia hong ngoai...");
    }
  } else {
    // Nếu cổng đang mở: chờ xe đi qua
    
    // 1. Chờ xe đi vào vùng cảm biến (Quét 1 lần, phản hồi ngay lập tức)
    if (digitalRead(IR_PIN) == IR_CAR_PRESENT) {
      Serial.println("-> Phat hien xe. Van giu cong...");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Xe dang qua...");
      lcd.setCursor(0, 1);
      lcd.print("Goc servo: ");
      lcd.print(ANGLE_OPEN);

      // 2. Chờ xe đi qua hẳn (Quét 1 lần, không cần giữ để xác thực)
      while (true) {
        if (digitalRead(IR_PIN) == IR_NO_CAR) {
          break; // Xe đã qua hẳn, thoát vòng lặp ngay lập tức
        }
        delay(10); // Thêm delay nhỏ để tránh block CPU (watchdog)
      }

      Serial.println("-> Xe da qua khoi. Chuan bi dong cong...");
      delay(1000); // Đợi thêm 1 giây an toàn sau khi xe đi qua
      
      // Đóng cổng lại
      Serial.println("-> Dong cong...");
      moveServoSmoothly(ANGLE_OPEN, ANGLE_CLOSED);
      isGateOpen = false;
      lastCloseTime = millis(); // Cập nhật lại thời gian đóng cổng gần nhất

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Dong cong.Goc:");
      lcd.print(ANGLE_CLOSED);
      lcd.setCursor(0, 1);
      lcd.print("Cho 5s de mo...");
    }
  }
}