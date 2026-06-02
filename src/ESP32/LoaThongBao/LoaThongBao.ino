#include <Arduino.h>
#include <WiFi.h>
#include "AudioFileSourceICYStream.h" // Thư viện đọc link nhạc stream
#include "AudioFileSourceBuffer.h"    // Thư viện tạo bộ đệm RAM
#include "AudioGeneratorMP3.h"        // Thư viện giải mã MP3
#include "AudioOutputI2S.h"           // Thư viện xuất tín hiệu ra chân I2S

// ================= CẤU HÌNH WIFI =================
const char* ssid = "DIEP CHI";
const char* password = "20152011";

// ================= CẤU HÌNH CHÂN I2S =================
#define I2S_DOUT  22 
#define I2S_BCLK  26 
#define I2S_LRC   25 

// Khởi tạo các con trỏ đối tượng
AudioGeneratorMP3 *mp3;
AudioFileSourceICYStream *file;
AudioFileSourceBuffer *buff;
AudioOutputI2S *out;

void setup() {
  Serial.begin(115200);
  Serial.println("\n--- BẮT ĐẦU TEST ESP8266Audio ---");

  // 1. Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nĐã kết nối WiFi thành công!");

  // 2. Thiết lập Đầu ra âm thanh (I2S)
  out = new AudioOutputI2S();
  out->SetPinout(I2S_BCLK, I2S_LRC, I2S_DOUT); // BCLK, LRC (WCLK), DOUT
  out->SetGain(0.8); // Mức âm lượng từ 0.0 đến 1.0 (Để 0.1 nghe cho đỡ giật mình)
  // out->SetOutputModeMono(true);

  // 3. Thiết lập Nguồn phát nhạc (Link MP3)
  Serial.println("Đang kết nối để tải nhạc...");
  file = new AudioFileSourceICYStream("http://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  
  // 4. Tạo bộ đệm RAM (Giúp tránh lỗi OOM)
  // Cấp phát 4096 bytes (4KB) cho bộ đệm, vừa đủ để nhạc không bị vấp mà không tràn RAM
  buff = new AudioFileSourceBuffer(file, 32768); 

  // 5. Khởi động bộ giải mã MP3
  mp3 = new AudioGeneratorMP3();
  mp3->begin(buff, out);
  
  Serial.println("Đang phát nhạc...");
}

void loop() {
  // Hàm mp3->isRunning() kiểm tra xem bài nhạc còn đang phát không
  if (mp3->isRunning()) {
    // mp3->loop() liên tục đẩy dữ liệu từ mạng ra I2S
    // Nếu mạng lag hoặc hết bài, nó sẽ trả về false
    if (!mp3->loop()) {
      mp3->stop();
      Serial.println("Đã dừng phát nhạc.");
    }
  }
}