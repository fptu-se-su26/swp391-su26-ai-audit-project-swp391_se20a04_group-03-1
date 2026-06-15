#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>
#include <driver/i2s.h>
#include <math.h>

// --- ĐỊNH NGHĨA CHÂN VÀ GÓC SERVO ---
#define SERVO_PIN 33
// Tinh chỉnh 2 thông số này để bù trừ góc lệch của Servo
#define ANGLE_CLOSED 170   // Góc đóng cổng (VD: Nếu lệch có thể sửa thành 5, 10, 15...)
#define ANGLE_OPEN   80  // Góc mở cổng (VD: Nếu lệch có thể sửa thành 85, 95, 100...)

#define I2S_BCLK  26
#define I2S_LRC   25
#define I2S_DOUT  27

#define IR_PIN    32 // Chân kết nối cảm biến hồng ngoại

// --- KHỞI TẠO ĐỐI TƯỢNG ---
LiquidCrystal_I2C lcd(0x27, 16, 2); // Địa chỉ I2C thường là 0x27 hoặc 0x3F
Servo gateServo;

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

// --- HÀM TẠO ÂM THANH (Tiếng "Tinh") QUA I2S ---
void playTone(float freq, int duration_ms) {
  int sample_rate = 44100;
  int num_samples = (sample_rate * duration_ms) / 1000;
  int16_t sample;
  size_t bytes_written;
  
  for (int i = 0; i < num_samples; i++) {
    // Tạo sóng sin (Sine wave). 10000.0 là biên độ (âm lượng), bạn có thể chỉnh nhỏ lại nếu loa quá to
    sample = (int16_t)(10000.0 * sin(2.0 * M_PI * freq * i / sample_rate)); 
    i2s_write(I2S_NUM_0, &sample, sizeof(sample), &bytes_written, portMAX_DELAY);
  }
  
  // Xóa bộ đệm I2S để tránh tiếng xì xì sau khi kêu xong
  i2s_zero_dma_buffer(I2S_NUM_0); 
}

void setup() {
  Serial.begin(115200);

  // 1. Khởi tạo màn hình LCD
  Wire.begin(21, 22); // Bắt buộc định nghĩa rõ chân SDA=21, SCL=22 cho ESP32
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("He thong san sang!");

  // 2. Khởi tạo Servo
  // ESP32Servo cần thiết lập timer riêng
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50); // Tần số chuẩn của Servo là 50Hz
  gateServo.attach(SERVO_PIN, 500, 2400); 
  
  gateServo.write(ANGLE_CLOSED); // Đưa cổng về vị trí đóng ban đầu

  // 3. Khởi tạo I2S cho loa
  setupI2S();

  // 4. Khởi tạo cảm biến hồng ngoại
  pinMode(IR_PIN, INPUT);

  delay(2000); // Đợi 2s trước khi vào vòng lặp chính
}

void loop() {
  // --- BƯỚC 1: ĐÓNG CỔNG & NGHỈ NGƠI ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Dang dong cong...");
  gateServo.write(ANGLE_CLOSED);
  delay(5000); 

  // --- BƯỚC 2: MỞ CỔNG VÀ CHÀO MỪNG ---
  gateServo.write(ANGLE_OPEN);
  lcd.clear();
  lcd.setCursor(4, 0); // Canh giữa dòng 1
  lcd.print("WELCOME!");
  
  // Phát tiếng "Tinh tinh tinh" (3 tiếng)
  for (int i = 0; i < 3; i++) {
    playTone(1200.0, 150); // Phát tần số 1200Hz trong 150 mili-giây
    delay(100);            // Nghỉ 100 mili-giây giữa các tiếng bip
  }

  // --- BƯỚC 3: CHỜ XE ĐI TỚI ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Cho xe di qua...");
  
  // Vòng lặp chờ mãi mãi cho đến khi có xe cắt tia hồng ngoại (LOW)
  while (digitalRead(IR_PIN) == HIGH) {
    delay(50); // Nghỉ 50ms để tránh treo vi điều khiển
  }

  // --- BƯỚC 4: XE ĐANG ĐI QUA ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Dang qua cong...");
  
  // Vòng lặp chờ mãi mãi cho đến khi xe đi qua hẳn (trở lại HIGH)
  while (digitalRead(IR_PIN) == LOW) {
    delay(50);
  }

  // --- BƯỚC 5: AN TOÀN & LẶP LẠI ---
  // Đợi thêm 1 giây sau khi đuôi xe vừa đi qua khỏi cảm biến
  delay(1000);
}