#include <Arduino.h>
#include <WiFi.h>
#include "AudioFileSourceHTTPStream.h"
#include "AudioGeneratorWAV.h"
#include "AudioOutputI2S.h"

// Khai báo thông tin Wi-Fi
const char* ssid = "TranViet";
const char* password = "123456789";

// Địa chỉ IP của máy tính đang chạy Server FastAPI
const char* audioURL = "http://10.62.167.57:8000/get-audio/";

AudioGeneratorWAV *wav;
AudioFileSourceHTTPStream *file;
AudioOutputI2S *out;

void setup() {
  Serial.begin(115200);

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nĐã kết nối WiFi!");

  // Cấu hình chân I2S xuất ra mạch MAX98357A
  out = new AudioOutputI2S();
  out->SetPinout(26, 27, 22); // BCLK, LRC, DIN
  
  wav = new AudioGeneratorWAV();
  file = new AudioFileSourceHTTPStream(audioURL);
  
  // Bắt đầu stream và phát nhạc từ Server
  if (wav->begin(file, out)) {
    Serial.println("Đang phát âm thanh...");
  } else {
    Serial.println("Lỗi: Không tìm thấy file WAV trên Server máy tính.");
  }
}

void loop() {
  if (wav && wav->isRunning()) {
    // Gọi hàm loop() liên tục để xử lý dòng dữ liệu streaming
    if (!wav->loop()) {
      wav->stop();
      Serial.println("Đã phát xong!");
    }
  }
}