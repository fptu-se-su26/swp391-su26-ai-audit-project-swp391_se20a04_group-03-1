# Hệ thống cổng + loa thông báo qua MQTT

Điều khiển 2 cổng ESP32 và phát thông báo giọng nói tại cổng, nối backend ↔ Pi 5 ↔ ESP32
bằng MQTT. Thay cho cách cũ (`fetch http://ESP32_IP/api/open-gate`) vốn chỉ chạy khi backend
cùng LAN với ESP32 và firmware cũ lại không có web server để nhận.

## 1. Kiến trúc

```
   Camera ──> Pi 5 (CV: YOLO+OCR) ──HTTP POST /api/scan──> Backend (cloud)
                                                              │  cấp ô đỗ
                                                              ▼
                                        ┌──────── MQTT broker (cloud, TLS 8883) ────────┐
                                        │                                               │
            smartparking/gate/<g>/cmd   │   smartparking/announce                       │
            smartparking/gate/<g>/audio │   smartparking/gate/<g>/status                │
                                        │                                               │
                    ┌───────────────────┘                          └──────────────────┐
                    ▼                                                                   ▼
              ESP32 cổng in/out                                                   Pi 5 (mqtt_loa.py)
         - nhận cmd  -> mở cổng + bíp                                        - nhận announce
         - nhận audio-> stream WAV từ Pi -> loa MAX98357A  <───HTTP LAN──── - Piper render WAV
         - publish status (mở/đóng/cháy...)                  (file WAV)      - serve HTTP + publish url
```

**Điểm mấu chốt:** chỉ các gói điều khiển nhỏ (JSON vài chục byte) đi qua broker cloud.
**File WAV (~150KB) truyền thẳng trong LAN** giữa Pi và ESP32 nên độ trễ nghe được gần như tức thời.

Số ô đỗ do **backend** quyết (`assignRandomFreeSlot`), nên câu *"...vào ô số X"* phải được
kích hoạt từ backend — không phải từ Pi hay ESP32.

## 2. Luồng một lần xe VÀO

1. CV (Pi) chốt biển số → POST `/api/scan` (giữ nguyên như cũ).
2. Backend tra lịch hẹn, cấp ô → publish:
   - `smartparking/gate/in/cmd` `{action:"open", plate, container}`
   - `smartparking/announce` `{gate:"in", plate, slot}`
3. ESP32-in nhận `cmd` → mở cổng + 3 tiếng bíp.
4. Pi nhận `announce` → Piper render câu → lưu WAV → publish
   `smartparking/gate/in/audio` `{url:"http://<pi-lan-ip>:8080/tb_xxx.wav"}`.
5. ESP32-in nhận `audio` → tải WAV từ Pi qua HTTP LAN → phát qua loa.

Xe RA tương tự nhưng `slot` để trống → Pi đọc câu *"...mời di chuyển ra cổng"*.

## 3. Bảng topic

| Topic | Chiều | Payload |
|---|---|---|
| `smartparking/gate/<g>/cmd` | backend → ESP32 | `{action:"open", plate, container}` |
| `smartparking/announce` | backend → Pi | `{gate, plate, slot}` (slot=null → câu ra) |
| `smartparking/gate/<g>/audio` | Pi → ESP32 | `{url, text}` |
| `smartparking/gate/<g>/status` | ESP32 → * | `{event, gate, ...}` (opening/opened/car_passing/closed/fire/offline) |
| `smartparking/pi/status` | Pi → * | `{event}` (online/offline) |

`<g>` = `in` hoặc `out`.

## 4. Broker (HiveMQ Cloud — free tier)

1. Tạo cluster free tại https://www.hivemq.com/mqtt-cloud-broker/ → được host dạng
   `xxxxxxxx.s1.eu.hivemq.cloud`, cổng TLS **8883**.
2. Tạo 1 credential (user/pass) dùng chung cho backend, Pi, ESP32 (hoặc tách riêng nếu muốn chặt).
3. Không cần mở cổng vào LAN: cả 3 phía đều **connect ra** broker.

> Có thể thay bằng EMQX Cloud, Mosquitto tự dựng có TLS... miễn là cả 3 phía tới được.

## 5. Cấu hình 3 thành phần

### ESP32 (cả `GateInTest` và `GetaOut02`)
Sửa khối đầu `src/main.cpp`:
```cpp
#define WIFI_SSID   "..."
#define WIFI_PASS   "..."
#define MQTT_HOST   "xxxxxxxx.s1.eu.hivemq.cloud"
#define MQTT_PORT   8883
#define MQTT_USER   "..."
#define MQTT_PASS   "..."
// GATE_ID đã đặt sẵn: "in" cho GateInTest, "out" cho GetaOut02 — KHÔNG đổi.
```
Nạp: `pio run -t upload` (thư viện PubSubClient + ArduinoJson tự tải theo `platformio.ini`).
Loa nối module **MAX98357A**: BCLK→26, LRC→25, DIN→27.

### Pi 5 (bridge Piper)
```bash
pip install piper-tts paho-mqtt          # onnxruntime Pi đã có sẵn cho RapidOCR
# tải giọng vi_VN-vais1000-medium như README_TTS.md

export MQTT_HOST=xxxxxxxx.s1.eu.hivemq.cloud MQTT_PORT=8883
export MQTT_USER=... MQTT_PASS=...
python tts_offline/mqtt_loa.py
```
Bridge tự đoán IP LAN của Pi cho URL WAV; đặt `LOA_HTTP_HOST` nếu đoán sai, `LOA_HTTP_PORT`
để đổi cổng (mặc định 8080). **Cổng 8080 của Pi phải cho ESP32 truy cập trong LAN.**

### Backend (cloud)
```bash
npm install            # đã thêm "mqtt" vào package.json
```
`.env`:
```
MQTT_URL="mqtts://xxxxxxxx.s1.eu.hivemq.cloud:8883"
MQTT_USERNAME="..."
MQTT_PASSWORD="..."
```
Thiếu `MQTT_URL` thì tính năng tự tắt (no-op), backend vẫn chạy.

## 6. Kiểm thử nhanh (không cần chạy cả hệ thống)

Cài `mosquitto-clients` rồi giả lập backend để test riêng ESP32 + Pi:

```bash
# 1. Bật bridge Pi (mqtt_loa.py) — nó sẽ nối broker và chờ.

# 2. Giả lệnh mở cổng vào:
mosquitto_pub -h <host> -p 8883 --capath /etc/ssl/certs -u <user> -P <pass> \
  -t smartparking/gate/in/cmd -m '{"action":"open","plate":"51A-12345"}'

# 3. Giả yêu cầu đọc loa (Pi render + đẩy url cho ESP32-in):
mosquitto_pub -h <host> -p 8883 --capath /etc/ssl/certs -u <user> -P <pass> \
  -t smartparking/announce -m '{"gate":"in","plate":"51A-12345","slot":"3"}'

# 4. Nghe status ESP32:
mosquitto_sub -h <host> -p 8883 --capath /etc/ssl/certs -u <user> -P <pass> \
  -t 'smartparking/gate/+/status'
```

Loa tại cổng in phải đọc: *"xe có biển số năm một a một hai ba bốn năm, di chuyển vào ô số ba."*

## 7. Ghi chú kỹ thuật

- **An toàn cháy độc lập mạng:** cổng vào vẫn mở khẩn cấp khi cảm biến cháy kích hoạt
  kể cả khi mất WiFi/MQTT — logic cháy không phụ thuộc network.
- **Một chủ I2S:** mọi phát loa (bíp + WAV) đi qua 1 task core-0 duy nhất; vòng lặp cổng
  (core-1) chỉ đẩy lệnh vào hàng đợi → không có 2 luồng cùng ghi loa, servo không giật.
- **ESP32 tự đọc sample rate từ header WAV** nên không phụ thuộc format cứng; Piper xuất
  mono 16-bit 22050Hz. Nếu sau này đổi giọng khác stereo/8-bit thì phải downmix thêm.
- **TLS:** ESP32 dùng `setInsecure()` (bỏ kiểm cert) cho gọn khi demo. Chặt hơn thì nạp
  root CA bằng `setCACert()`.
- **LWT:** ESP32/Pi đăng ký "last will" — rớt mạng thì broker tự báo `offline` (retained),
  backend/monitor biết ngay cổng nào mất kết nối.
```
