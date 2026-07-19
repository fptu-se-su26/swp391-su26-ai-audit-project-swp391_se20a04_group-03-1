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
| `smartparking/announce` | backend → Pi | `{gate, plate, slot}` (slot=null → câu ra) **hoặc** `{gate, error}` (đọc nguyên văn câu lỗi) |
| `smartparking/gate/<g>/audio` | Pi → ESP32 | `{url, text}` |
| `smartparking/gate/<g>/status` | ESP32 → * | `{event, gate, ...}` (opening/opened/car_passing/closed/fire/offline) |
| `smartparking/pi/status` | Pi → * | `{event}` (online/offline) |

`<g>` = `in` hoặc `out`.

### Giám sát container đúng ô tại bãi

Ngoài quét ở cổng, **camera bãi** kiểm tra container có đỗ ĐÚNG Ô không:

```
Camera bãi ─> CV yard_verifier: OCR mã container + xác định ô (theo hình học slot)
           ─HTTP POST /api/yards/<id>/verify-slot {slotName, containerNo}─> Backend
Backend đối chiếu GateTransaction{status:"in", yardId, assignedSlot}.actualContainerNo:
   - khớp   -> emit "yard_slot_verified"
   - lệch   -> publishAnnounceError("in", "...sai vị trí...") + emit "yard_slot_mismatch"
             (loa CỔNG IN đọc, cùng đường với câu lỗi ở mục dưới)
```

Ba loại cảnh báo: `wrong_container` (ô đã cấp cho container khác), `misplaced_in_empty`
(ô trống nhưng có container), `unknown_container` (mã lạ không có trong bãi). Nếu tra được
ô đúng của container thì loa đọc kèm hướng dẫn ("...phải đỗ ở ô X"). CV vote CẤP-Ô, backend
debounce loa 30s theo (bãi+ô+mã).

**Chỉ quét khi ô BỊ XE CHIẾM:** CV phát hiện phương tiện (car/truck/bus) đè lên ô đã vẽ mới
coi là ô bị chiếm; **chỉ khi đó** mới OCR mã container trong ô đó và đối chiếu — ô trống thì
bỏ qua, đỡ tốn CPU và tránh báo nhầm. Trên luồng video, AI chạy ở **thread riêng** (không làm
lag stream), box XE = cam, box CONTAINER đang quét = vàng (kèm mã), ô đỏ = bị chiếm / xanh = trống.

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

#### Chạy tự động lúc boot (systemd)

Cách `export` ở trên chỉ sống trong 1 phiên shell: đóng SSH là bridge chết, reboot là mất
biến. Pi đặt ngoài cổng thì phải tự chạy lại sau mất điện — dùng service:

```bash
# 1. Biến môi trường + mật khẩu (KHÔNG nằm trong repo)
sudo cp tts_offline/loa-tts.env.example /etc/loa-tts.env
sudo nano /etc/loa-tts.env          # điền MQTT_HOST/USER/PASS thật
sudo chmod 600 /etc/loa-tts.env     # chỉ root đọc

# 2. Service
sudo cp tts_offline/loa-tts.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now loa-tts

# 3. Kiểm tra
systemctl status loa-tts
journalctl -u loa-tts -f            # phải thấy "Đã nối MQTT ..." 
```

`loa-tts.service` giả định: user `pi`, venv `~/venv-tts`, repo ở `~/swp391-...`. Khác thì
sửa `User=`, `WorkingDirectory=`, `ExecStart=` cho khớp.

Sau khi bật service, **đừng chạy `python tts_offline/mqtt_loa.py` bằng tay nữa** — hai tiến
trình sẽ tranh nhau cổng 8080 và cùng subscribe `announce` (mỗi câu bị đọc 2 lần). Sửa code
xong thì `sudo systemctl restart loa-tts`.

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

# 4. Giả một câu LỖI (xe bị từ chối) để loa cổng ra đọc nguyên văn:
mosquitto_pub -h <host> -p 8883 --capath /etc/ssl/certs -u <user> -P <pass> \
  -t smartparking/announce -m '{"gate":"out","error":"Không tìm thấy dữ liệu vào bãi của xe này. Vui lòng liên hệ nhân viên."}'

# 5. Nghe status ESP32:
mosquitto_sub -h <host> -p 8883 --capath /etc/ssl/certs -u <user> -P <pass> \
  -t 'smartparking/gate/+/status'
```

**Loa đọc lỗi:** MỌI message `gate_scan_error` mà backend phát cho dashboard (qua cửa chung
`emitGateError`) đều được đọc ra loa cổng: không có lịch hẹn, sai giờ, bãi đầy, xe đã trong
bãi, không có dữ liệu vào bãi, chở container ra ngoài, **và cả** các cảnh báo *"đang chờ quét
biển/container"* / *"quá 1 phút"*. Backend publish `smartparking/announce` `{gate, error}` →
Pi đọc **nguyên văn** ra loa. Trước khi gửi, backend **làm sạch** câu (`sanitizeForSpeech`):
bỏ `[...]`/`(...)`, đổi "container" → "công-ten-nơ", hạ chữ HOA gào thét. Chống lặp
**30s theo (cổng + biển + câu)**: câu y hệt bắn mỗi frame chỉ đọc lại sau 30s, câu KHÁC vẫn
đọc ngay. `gate_scan_success` **không** đọc lại vì đã có câu chuẩn (biển đọc rời + số ô) qua
`publishAnnounce`; `gate_scan_update` là dữ liệu bảng, không phải câu nói.

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
