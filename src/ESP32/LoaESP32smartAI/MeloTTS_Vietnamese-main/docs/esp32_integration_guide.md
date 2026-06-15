# Hướng dẫn tích hợp MeloTTS với ESP32 để phát âm thanh

Tài liệu này hướng dẫn chi tiết cách kết nối hệ thống AI tạo giọng nói (MeloTTS chạy trên máy tính) với vi điều khiển ESP32 để phát âm thanh ra loa ngoài.

## 1. Mô hình hoạt động (Architecture)

ESP32 có tài nguyên bộ nhớ và xử lý rất hạn chế nên không thể tự chạy trực tiếp mô hình trí tuệ nhân tạo khổng lồ như MeloTTS. Vì vậy, chúng ta sẽ sử dụng mô hình **Client - Server**:
- **Máy tính (Server)**: Đóng vai trò là bộ não. Nó sẽ nhận file text bạn gửi, sử dụng mô hình MeloTTS để chuyển thành file âm thanh `.wav`, đồng thời tạo một Web Server cục bộ (Local API) để lưu trữ file âm thanh đó.
- **ESP32 (Client)**: Đóng vai trò là cái miệng. Được kết nối vào cùng mạng Wi-Fi với máy tính. Khi máy tính sinh xong âm thanh, ESP32 sẽ gửi yêu cầu tải/stream file `.wav` về và xuất tín hiệu ra loa.

---

## 2. Chuẩn bị phần cứng

1. **Board mạch ESP32** (Ví dụ: ESP32 Dev Module, NodeMCU-32S, v.v...).
2. **Module khuếch đại âm thanh I2S** (Khuyên dùng module: **MAX98357A** - Giao tiếp qua I2S cho âm thanh lớn, rõ nét, hoàn toàn không bị nhiễu rè như khi dùng chân PWM thông thường).
3. **Một chiếc Loa** (Speaker) loại 3W, 4 Ohm (hoặc tương tự tuỳ vào module khuếch đại).
4. **Dây cắm breadboard (Jumper wires)**.

### Sơ đồ đấu nối ESP32 với MAX98357A
| Chân trên MAX98357A | Chân nối trên ESP32 |
|---------------------|-----------------|
| VIN / VCC           | 5V (hoặc 3.3V)  |
| GND                 | GND             |
| BCLK (Bit Clock)    | GPIO 26         |
| LRC (Left/Right Clk)| GPIO 25         |
| DIN (Data In)       | GPIO 22         |
| +, -                | Đấu ra 2 cực của Loa |

---

## 3. Cài đặt trên Máy Tính (Server)

Chúng ta cần tạo một API cực nhanh bằng thư viện `FastAPI` (Python).

**Bước 1:** Cài đặt các thư viện mạng. Mở Command Prompt (cmd) đã kích hoạt môi trường ảo (`venv`) và chạy:
```cmd
pip install fastapi uvicorn python-multipart
```

**Bước 2:** Tạo một file có tên `api_server.py` trong thư mục gốc của dự án (cùng cấp với `chay_thu.py`) với nội dung như sau:
```python
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import torch
from melo.api import TTS

app = FastAPI()

# Khởi tạo mô hình AI 1 lần duy nhất trên Server (giúp thời gian phản hồi siêu nhanh)
device = "cuda:0" if torch.cuda.is_available() else "cpu"
model = TTS(language="VI", device=device, config_path="models/config.json", ckpt_path="models/G_model.pth")
speaker_id = 0

@app.post("/generate-tts/")
async def generate_tts(file: UploadFile = File(...)):
    # Nhận file txt và lấy ra nội dung
    content = await file.read()
    text = content.decode("utf-8").strip()
    
    # AI tạo file âm thanh từ chữ
    output_path = "ket_qua.wav"
    model.tts_to_file(text, speaker_id, output_path, speed=1.0, quiet=True)
    
    print(f"Đã tạo file âm thanh thành công cho văn bản: {text}")
    return {"message": "Thành công", "audio_url": "/get-audio/"}

@app.get("/get-audio/")
def get_audio():
    # Mở liên kết để ESP32 có thể truy cập và tải audio về
    return FileResponse("ket_qua.wav", media_type="audio/wav")

# Chạy server ở màn hình Terminal bằng: uvicorn api_server:app --host 0.0.0.0 --port 8000
```

**Bước 3:** Chạy Server. Lấy **Địa chỉ IPv4** của máy tính (Mở cmd gõ `ipconfig` -> xem dòng IPv4 Address, giả sử là `192.168.1.10`) và tiến hành chạy lệnh khởi động server:
```cmd
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

---

## 4. Cài đặt trên ESP32 (Arduino IDE)

**Bước 1:** Trong phần mềm Arduino IDE, chọn `Sketch` -> `Include Library` -> `Manage Libraries...`. Tìm và cài đặt thư viện **ESP8266Audio** (Của tác giả Earle F. Philhower). Thư viện này hỗ trợ truyền tải `.wav` trực tiếp qua HTTP và phát qua I2S rất mạnh mẽ.

**Bước 2:** Chép đoạn code sau nạp vào ESP32 (Nhớ sửa lại dòng chữ WiFi và IP máy tính):

```cpp
#include <WiFi.h>
#include "AudioFileSourceHTTPStream.h"
#include "AudioGeneratorWAV.h"
#include "AudioOutputI2S.h"

// Khai báo thông tin Wi-Fi
const char* ssid = "TEN_WIFI_CUA_BAN";
const char* password = "MAT_KHAU_WIFI";

// Địa chỉ IP của máy tính đang chạy Server FastAPI
// Hãy thay IP bên dưới bằng IPv4 thật của máy tính bạn (giữ nguyên /get-audio/)
const char* audioURL = "http://192.168.1.10:8000/get-audio/";

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
  out->SetPinout(26, 25, 22); // BCLK, LRC, DIN
  
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
```

---

## 5. Hướng dẫn quy trình vận hành

1. **Bật Server:** Đảm bảo `uvicorn` vẫn đang mở trên máy tính (sẽ có dòng chữ `Application startup complete.`).
2. **Gửi File Text đến máy tính:** Bạn có thể tạo 1 file `thong_bao.txt`, ghi nội dung cần đọc vào đó. Mở 1 cửa sổ cmd khác để giả lập việc gửi file này đến server PC (Sử dụng lệnh `curl`):
   ```cmd
   curl -X POST "http://127.0.0.1:8000/generate-tts/" -F "file=@thong_bao.txt"
   ```
   Lúc này PC sẽ chạy AI ngay lập tức và tạo đè vào file `ket_qua.wav`.
3. **Phát trên loa ESP32:** Nhấn nút `Reset` (`EN`) trên board mạch ESP32. Khởi động xong, ESP32 kết nối Wi-Fi, tự động gọi vào đường link `http://IP_MAY_TINH:8000/get-audio/` và âm thanh sẽ được tuôn thẳng ra chiếc loa ngoài của bạn!

> **Gợi ý mở rộng:** 
> Bạn hoàn toàn có thể lập trình nâng cao hơn: Kết nối ứng dụng điện thoại hoặc MQTT để gửi file text. Hoặc làm 1 nút nhấn nối với ESP32, khi có người nhấn nút thì ESP32 sẽ gửi tín hiệu báo cho PC sinh âm thanh rồi tải về phát ngay lập tức.
