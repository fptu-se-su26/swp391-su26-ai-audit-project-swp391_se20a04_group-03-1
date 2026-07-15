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
// (Bạn có thể thay đổi các chân này tuỳ theo sơ đồ đấu nối thực tế của thiết
// bị)
#define LED1_PIN 13
#define LED2_PIN 12
#define LED3_PIN 14

// --- ĐỊNH NGHĨA CHÂN CHO BÁO CHÁY VÀ CÒI ---
#define FIRE_SENSOR_PIN 34 // Chân DO của cảm biến báo cháy
#define BUZZER_PIN 4       // Chân điều khiển còi MH-FMG
#define FIRE_DETECTED LOW  // Trạng thái khi phát hiện có lửa (cảm biến IR thường xuất LOW)

// --- ĐỊNH NGHĨA TRẠNG THÁI CẢM BIẾN ---
// CHÚ Ý: Cảm biến hồng ngoại (IR) phổ biến (như FC-51) thường xuất mức LOW khi
// CÓ vật cản.
#define IR_CAR_PRESENT HIGH // Trạng thái khi CÓ xe cản tia hồng ngoại
#define IR_NO_CAR LOW       // Trạng thái khi KHÔNG CÓ xe

// --- KHỞI TẠO ĐỐI TƯỢNG ---
LiquidCrystal_I2C lcd(0x27, 16, 2);
// SDA: 21
// SCL: 22
Servo gateServo;

// --- BIẾN TRẠNG THÁI ---
unsigned long lastCloseTime = 0;
bool isGateOpen = false;

// --- HÀM ĐIỀU KHIỂN 3 ĐÈN CÙNG LÚC ---
void set3LEDs(int state) {
  digitalWrite(LED1_PIN, state);
  digitalWrite(LED2_PIN, state);
  digitalWrite(LED3_PIN, state);
}

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
    i2s_write(I2S_NUM_0, &sample, sizeof(sample), &bytes_written,
              10 / portTICK_PERIOD_MS);
  }

  i2s_zero_dma_buffer(I2S_NUM_0);
}

// --- HÀM ĐIỀU KHIỂN SERVO (MƯỢT NHẤT, KHÔNG DỪNG) ---
void moveServoSmoothly(int startAngle, int targetAngle) {
  int delayMs = 15; // Dừng 15ms cho mỗi độ để quay mượt

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

  // 1. Khởi tạo 3 đèn LED là OUTPUT và đặt trạng thái ban đầu là tắt
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);
  set3LEDs(LOW); // Đảm bảo đèn tắt khi hệ thống mới khởi động

  // 2. Khởi tạo màn hình LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  // Cập nhật text thành GateIn cho đúng module
  lcd.print("He thong GateIn");
  delay(1000);

  // 3. Khởi tạo Servo
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50);
  gateServo.attach(SERVO_PIN, 500, 2400);
  gateServo.write(ANGLE_CLOSED);

  // 4. Khởi tạo I2S cho loa
  setupI2S();

  // 5. Khởi tạo cảm biến hồng ngoại
  pinMode(IR_PIN, INPUT);

  // 5.1. Khởi tạo cảm biến lửa và còi báo cháy
  pinMode(FIRE_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW); // Tắt còi ban đầu

  // 6. Thiết lập trạng thái ban đầu
  isGateOpen = false;
  lastCloseTime = millis(); // Bắt đầu tính thời gian để mở cổng

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Dong cong.Goc:");
  lcd.print(ANGLE_CLOSED);
  lcd.setCursor(0, 1);
  lcd.print("Cho 5s de mo...");
  Serial.println("GateIn Test Ready! Cho 5 giay de mo cong...");
}

void loop() {
  // --- ƯU TIÊN KIỂM TRA BÁO CHÁY ---
  if (digitalRead(FIRE_SENSOR_PIN) == FIRE_DETECTED) {
    Serial.println("!!! PHAT HIEN CHAY !!! COI BAO DONG KICH HOAT !!!");
    digitalWrite(BUZZER_PIN, HIGH); // Bật còi MH-FMG kêu liên tục
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("!!! CANH BAO !!!");
    lcd.setCursor(0, 1);
    lcd.print("PHAT HIEN CHAY");
    
    // Vòng lặp chờ đến khi ngọn lửa tắt (loa kêu liên tục)
    while (digitalRead(FIRE_SENSOR_PIN) == FIRE_DETECTED) {
      delay(100);
      yield(); // Tránh lỗi Watchdog Timer trên ESP32
    }
    
    // Ngọn lửa đã tắt -> Tắt còi
    Serial.println("-> Da tat ngon lua. Tat coi bao dong.");
    digitalWrite(BUZZER_PIN, LOW);
    
    // Khôi phục lại giao diện LCD tuỳ theo trạng thái cổng hiện tại
    lcd.clear();
    if (isGateOpen) {
      lcd.setCursor(0, 0);
      lcd.print("Mo cong. Goc:");
      lcd.print(ANGLE_OPEN);
      lcd.setCursor(0, 1);
      lcd.print("Moi xe vao...");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("Dong cong.Goc:");
      lcd.print(ANGLE_CLOSED);
      lcd.setCursor(0, 1);
      lcd.print("Cho 5s de mo...");
    }
    
    // Cập nhật lại thời gian để không bị mở/đóng cổng sai nhịp do thời gian chờ
    lastCloseTime = millis();
  }

  if (!isGateOpen) {
    // Nếu cổng đang đóng, kiểm tra xem đã đủ 5 giây chưa (để tự động mở, có thể
    // thay đổi sau này)
    if (millis() - lastCloseTime >= 5000) {
      Serial.println("-> Da du 5s, mo cong!");

      // Mở cổng
      moveServoSmoothly(ANGLE_CLOSED, ANGLE_OPEN);
      isGateOpen = true;

      // YÊU CẦU: Đèn sáng liên tục khi mở cửa
      Serial.println("-> Bat 3 den (sang lien tuc)");
      set3LEDs(HIGH);

      // Cập nhật LCD
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Mo cong. Goc:");
      lcd.print(ANGLE_OPEN);
      lcd.setCursor(0, 1);
      lcd.print("Moi xe vao..."); // Cập nhật text cho GateIn (xe vào)

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

    // 1. Chờ xe đi vào vùng cảm biến
    if (digitalRead(IR_PIN) == IR_CAR_PRESENT) {
      Serial.println("-> Phat hien xe. Van giu cong...");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Xe dang qua...");
      lcd.setCursor(0, 1);
      lcd.print("Goc servo: ");
      lcd.print(ANGLE_OPEN);

      // 2. Chờ xe đi qua hẳn
      while (true) {
        if (digitalRead(IR_PIN) == IR_NO_CAR) {
          break; // Xe đã qua hẳn
        }
        delay(10);
      }

      Serial.println("-> Xe da qua khoi. Chuan bi dong cong...");
      delay(1000); // Đợi thêm 1 giây an toàn sau khi xe đi qua

      // YÊU CẦU: Trong khi đóng cửa thì sẽ nháy liên tục 3 cái rồi tắt
      Serial.println("-> Qua trinh dong cua: Nhay den 3 lan roi tat...");
      for (int i = 0; i < 3; i++) {
        set3LEDs(LOW);
        delay(250);
        set3LEDs(HIGH);
        delay(250);
      }
      // Tắt hẳn 3 đèn sau khi nháy xong
      set3LEDs(LOW);

      // Bắt đầu đóng cổng lại bằng servo
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