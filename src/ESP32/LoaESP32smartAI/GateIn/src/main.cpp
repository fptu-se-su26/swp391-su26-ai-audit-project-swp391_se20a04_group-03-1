#include <Arduino.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <driver/i2s.h>
#include <math.h>
#include <WiFi.h>
#include <WebServer.h>

// --- THÔNG TIN WIFI ---
// Thay đổi thông tin này khớp với mạng WiFi của bạn
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Khởi tạo WebServer ở port 80
WebServer server(80);

// --- ĐỊNH NGHĨA CHÂN VÀ GÓC SERVO ---
#define SERVO_PIN 33
// Tinh chỉnh 2 thông số này để bù trừ góc lệch của Servo
#define ANGLE_CLOSED 170 // Góc đóng cổng (VD: Nếu lệch có thể sửa thành 5, 10, 15...)
#define ANGLE_OPEN   80 // Góc mở cổng (VD: Nếu lệch có thể sửa thành 85, 95, 100...)

#define I2S_BCLK 26
#define I2S_LRC 25
#define I2S_DOUT 27

#define IR_PIN 32 // Chân kết nối cảm biến hồng ngoại

// --- KHỞI TẠO ĐỐI TƯỢNG ---
LiquidCrystal_I2C lcd(0x27, 16, 2); // Địa chỉ I2C thường là 0x27 hoặc 0x3F
// SDA -> Chân GPIO 21
// SCL -> Chân GPIO 22
Servo gateServo;

// --- BIẾN TRẠNG THÁI ---
bool shouldOpenGate = false;
String currentTruckPlate = "";
String currentContainer = "";

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
    // Tạo sóng sin (Sine wave). 10000.0 là biên độ (âm lượng), bạn có thể chỉnh
    // nhỏ lại nếu loa quá to
    sample = (int16_t)(10000.0 * sin(2.0 * M_PI * freq * i / sample_rate)); 
    // Thay portMAX_DELAY bằng 10 ticks để tránh treo ESP32 (WDT Reset) nếu I2S bị nghẽn
    i2s_write(I2S_NUM_0, &sample, sizeof(sample), &bytes_written, 10 / portTICK_PERIOD_MS);
  }
  
  // Xóa bộ đệm I2S để tránh tiếng xì xì sau khi kêu xong
  i2s_zero_dma_buffer(I2S_NUM_0); 
}

// --- API XỬ LÝ KHI BACKEND GỌI ĐẾN ESP32 ---
void handleOpenGate() {
  if (server.hasArg("plate")) {
    currentTruckPlate = server.arg("plate");
    currentTruckPlate.trim(); // Loại bỏ khoảng trắng hoặc ký tự xuống dòng bị lỗi
  } else {
    currentTruckPlate = "";
  }

  if (server.hasArg("container")) {
    currentContainer = server.arg("container");
    currentContainer.trim();
  } else {
    currentContainer = "";
  }
  
  shouldOpenGate = true;
  
  // Trả về HTTP 200 OK cho backend biết đã nhận lệnh
  server.send(200, "application/json", "{\"status\":\"success\", \"message\":\"Opening gate\"}");
  Serial.println("Nhan lenh mo cong tu Backend cho xe: [" + currentTruckPlate + "] - Cont: [" + currentContainer + "]");
}

void setup() {
  Serial.begin(115200);

  // 1. Khởi tạo màn hình LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("He thong LCD OK!"); // Dòng test cứng để chắc chắn LCD không lỗi
  delay(1000);

  // 2. Khởi tạo Servo
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

  // 5. Kết nối WiFi
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Ket noi WiFi...");
  WiFi.begin(ssid, password);
  
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected.");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("IP: ");
    lcd.print(WiFi.localIP().toString());
    
    // 6. Cấu hình WebServer
    server.on("/api/open-gate", HTTP_GET, handleOpenGate); // Có thể đổi thành HTTP_POST tùy ý
    server.begin();
    Serial.println("HTTP server started");
  } else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Failed!");
  }

  delay(3000);

  // Hiển thị trạng thái chờ
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("San sang!");
}

void loop() {
  // Lắng nghe các request từ Backend gửi tới
  server.handleClient();

  // Khi có lệnh mở cổng từ hàm handleOpenGate()
  if (shouldOpenGate) {
    Serial.println("-> Bat dau mo cong!");
    
    // --- BƯỚC 1: MỞ CỔNG VÀ CHÀO MỪNG ---
    gateServo.write(ANGLE_OPEN);
    Serial.println("-> Da quay Servo.");
    
    lcd.clear();
    
    // An toàn: Cắt chuỗi để đảm bảo không in lố 16 ký tự gây lỗi hiện ô vuông trắng
    String plateSafe = currentTruckPlate;
    if (plateSafe.length() > 12) plateSafe = plateSafe.substring(0, 12);
    
    lcd.setCursor(0, 0);
    lcd.print("Xe: ");
    lcd.print(plateSafe);
    
    lcd.setCursor(0, 1);
    if (currentContainer.length() > 0 && currentContainer != "undefined" && currentContainer != "null") {
      String contSafe = currentContainer;
      if (contSafe.length() > 13) contSafe = contSafe.substring(0, 13);
      lcd.print("C: ");
      lcd.print(contSafe);
    } else {
      lcd.print("Moi xe qua cong!");
    }
    Serial.println("-> Da in len LCD.");
    
    // Phát tiếng "Tinh tinh tinh" (3 tiếng)
    Serial.println("-> Phat am thanh...");
    for (int i = 0; i < 3; i++) {
      playTone(1200.0, 150); // Phát tần số 1200Hz trong 150 mili-giây
      delay(100);            // Nghỉ 100 mili-giây giữa các tiếng bip
      yield(); // Chống lỗi Watchdog (WDT)
    }

    // --- BƯỚC 2: CHỜ XE ĐI TỚI CỔNG ---
    Serial.println("-> Dang cho xe di qua tia hong ngoai...");
    unsigned long waitStart = millis();
    // Chờ tối đa 30 giây để xe đi tới cắt ngang cảm biến
    while (digitalRead(IR_PIN) == HIGH) {
      server.handleClient(); // Tiếp tục lắng nghe mạng
      delay(50); // Nghỉ 50ms để tránh treo vi điều khiển
      if (millis() - waitStart > 30000) { 
        Serial.println("-> Timeout: Xe khong di qua cong (qua 30s).");
        break; // Hết 30s mà xe chưa qua thì thoát vòng lặp
      }
    }

    // --- BƯỚC 3: XE ĐANG ĐI QUA CỔNG ---
    if (digitalRead(IR_PIN) == LOW) { // Nếu đúng là xe đã đi qua (cảm biến bị cắt)
      Serial.println("-> Phat hien xe dang qua cong!");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Dang di qua...");
      
      // Chờ cho đuôi xe đi qua hẳn cảm biến (cảm biến hết bị cắt)
      while (digitalRead(IR_PIN) == LOW) {
        server.handleClient();
        delay(50); // Nghỉ 50ms để tránh treo vi điều khiển
      }
      
      Serial.println("-> Xe da qua xong. Cho them 1 giay an toan.");
      // Đợi thêm 1 giây an toàn sau khi đuôi xe qua hẳn
      delay(1000);
    }

    // --- BƯỚC 4: AN TOÀN & ĐÓNG CỔNG LẠI ---
    Serial.println("-> Dong cong...");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Dong cong...");
    gateServo.write(ANGLE_CLOSED);
    
    // Reset trạng thái
    shouldOpenGate = false;
    currentTruckPlate = "";
    currentContainer = "";
    
    delay(2000);

    // Trở lại màn hình chờ mặc định
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("San sang!");
    if (WiFi.status() == WL_CONNECTED) {
      lcd.setCursor(0, 1);
      lcd.print(WiFi.localIP().toString());
    }
    Serial.println("-> Hoan thanh. Cho lenh moi.");
  }
}