#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WebServer.h>
#include <SPIFFS.h>
#include "AudioFileSourceSPIFFS.h"
#include "AudioGeneratorWAV.h"
#include "AudioOutputI2S.h"

// Khai báo thông tin Wi-Fi
const char* ssid = "TTTD";
const char* password = "05082005";

// Địa chỉ API của máy chủ RunPod
const char* generateURL = "https://lts9ul0n52gr04-5004.proxy.runpod.net/generate-tts/";
const char* audioURL = "https://lts9ul0n52gr04-5004.proxy.runpod.net/get-audio/";

AudioGeneratorWAV *wav = NULL;
AudioFileSourceSPIFFS *file = NULL;
AudioOutputI2S *out = NULL;

WebServer server(80);

const char* html_page = R"=====(
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loa Thông Minh ESP32</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; margin: 0; padding: 20px; background-color: #f0f2f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-bottom: 20px; }
    textarea { width: 100%; height: 120px; font-size: 16px; padding: 15px; border: 2px solid #ddd; border-radius: 10px; box-sizing: border-box; resize: vertical; margin-bottom: 20px; }
    textarea:focus { border-color: #1a73e8; outline: none; }
    button { background-color: #1a73e8; color: white; border: none; font-size: 18px; padding: 12px 30px; border-radius: 25px; cursor: pointer; transition: background-color 0.3s; }
    button:hover { background-color: #1557b0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Loa Thông Minh ESP32 AI</h2>
    <p>Nhập văn bản (chữ, số, ký tự Latinh):</p>
    <form action="/speak" method="POST">
      <textarea name="text" placeholder="Ví dụ: Lớp SWP391 nhóm 3 có 5 thành viên ABC."></textarea><br>
      <button type="submit">Phát Giọng Nói</button>
    </form>
  </div>
</body>
</html>
)=====";

void generateAndPlayTTS(String text) {
  // Dừng luồng phát âm thanh hiện tại ngay lập tức để giải phóng RAM cho tiến trình HTTP tải file
  if (wav) {
    if (wav->isRunning()) wav->stop();
    delete wav;
    wav = NULL;
  }
  if (file) {
    file->close();
    delete file;
    file = NULL;
  }

  Serial.println("Đang xử lý chuỗi văn bản...");
  WiFiClientSecure client;
  client.setInsecure(); // Bỏ qua kiểm tra SSL vì API dùng HTTPS
  
  HTTPClient http;
  http.begin(client, generateURL);
  
  // Gửi trực tiếp chuỗi văn bản dạng RAW Text (vì server đã được cập nhật để đọc Raw Body)
  // Không cần URL Encode, không cần multipart. Đây là cách chuẩn, gọn nhẹ và chống lỗi tốt nhất!
  http.addHeader("Content-Type", "text/plain; charset=utf-8");
  
  Serial.println("Đang chờ server AI xử lý và sinh file...");
  int httpResponseCode = http.POST(text);
  
  if (httpResponseCode == 200) {
    Serial.println("Server xử lý xong! Đang tiến hành tải dữ liệu âm thanh...");
    http.end(); 
    
    // Tải file âm thanh sinh ra từ máy chủ về bộ nhớ SPIFFS của ESP32
    http.begin(client, audioURL);
    int getCode = http.GET();
    if (getCode == 200) {
      File f = SPIFFS.open("/audio.wav", "w");
      if (f) {
        http.writeToStream(&f);
        f.close();
        Serial.println("Đã đồng bộ file! Bắt đầu phát ra loa...");
        
        file = new AudioFileSourceSPIFFS("/audio.wav");
        wav = new AudioGeneratorWAV();
        
        if (wav->begin(file, out)) {
          Serial.println("Hệ thống âm thanh I2S đang hoạt động...");
        } else {
          Serial.println("Lỗi: Định dạng file WAV trả về từ AI không tương thích.");
        }
      } else {
        Serial.println("Lỗi: Không thể can thiệp ghi dữ liệu vào SPIFFS.");
      }
    } else {
      Serial.printf("Lỗi khi kết nối lấy file âm thanh, mã lỗi: %d\n", getCode);
    }
  } else {
    Serial.printf("Lỗi gửi gói tin lên hệ thống AI: %d - %s\n", httpResponseCode, http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

void handleRoot() {
  server.send(200, "text/html", html_page);
}

void handleSpeak() {
  if (server.hasArg("text")) {
    String text = server.arg("text");
    
    String response = "<html><head><meta charset='utf-8'><title>Đang xử lý...</title></head><body style='text-align:center;font-family:sans-serif;margin-top:50px;background:#f0f2f5;'>";
    response += "<h2 style='color:#1a73e8;'>Hệ thống AI đang dịch văn bản và số...</h2>";
    response += "<p>Vui lòng đợi vài giây, loa sẽ tự động phát âm thanh.</p>";
    response += "<a href='/' style='display:inline-block;padding:10px 20px;margin-top:20px;background:#1a73e8;color:white;text-decoration:none;border-radius:25px;'>Quay Lại Trang Chủ</a>";
    response += "</body></html>";
    server.send(200, "text/html", response);
    
    generateAndPlayTTS(text);
  } else {
    server.send(400, "text/plain", "Nội dung trống!");
  }
}

void setup() {
  Serial.begin(115200);

  if (!SPIFFS.begin(true)) {
    Serial.println("Lỗi: SPIFFS bị hỏng hoặc không thể mount!");
    return;
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nKết nối mạng thành công!");

  // Thiết lập phần cứng I2S 
  out = new AudioOutputI2S();
  out->SetPinout(26, 27, 22); // BCLK, LRC, DIN kết nối tới mạch MAX98357A
  
  server.on("/", HTTP_GET, handleRoot);
  server.on("/speak", HTTP_POST, handleSpeak);
  server.begin();
  
  Serial.println("======================================");
  Serial.print("Web Server kích hoạt tại địa chỉ IP: http://");
  Serial.println(WiFi.localIP());
  Serial.println("======================================");
}

void loop() {
  server.handleClient();
  
  if (wav && wav->isRunning()) {
    // Xử lý stream liên tục
    if (!wav->loop()) {
      wav->stop();
      Serial.println("Đã phát xong âm thanh!");
    }
  }
}