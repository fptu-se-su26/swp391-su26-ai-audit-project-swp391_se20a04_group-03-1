# -*- coding: utf-8 -*-
"""
Cầu nối MQTT <-> Piper <-> loa ESP32 — CHẠY THẲNG TRÊN PI 5.

Vai trò: Pi là "bộ tạo giọng", ESP32 là "cái loa tại cổng".

Luồng:
    backend (cloud) --MQTT--> [smartparking/announce]  { gate, plate, slot }
        -> Pi render câu bằng Piper ra file WAV
        -> Pi phục vụ file đó qua HTTP trong mạng LAN (nhẹ, nhanh, không mã hoá)
        -> Pi publish [smartparking/gate/<gate>/audio] { url, text }
    ESP32 tại cổng nhận url -> stream WAV về -> phát qua MAX98357A.

Chỉ GÓI ĐIỀU KHIỂN nhỏ đi qua broker cloud; FILE WAV truyền nội bộ LAN giữa Pi và ESP32.

Vì sao tách render (Pi) khỏi phát (ESP32):
    ESP32 không đủ sức chạy TTS. Pi render 1 câu ~0.11s (đã đo), rồi chỉ đẩy URL vài chục
    byte qua MQTT. WAV ~150KB đi trong LAN nên độ trễ nghe được là gần như tức thời.

Cài trên Pi:
    pip install piper-tts paho-mqtt        # onnxruntime Pi đã có sẵn cho RapidOCR
    (giọng vi_VN-vais1000-medium tải như trong README_TTS.md)

Chạy:
    export MQTT_HOST=xxxxx.s1.eu.hivemq.cloud MQTT_PORT=8883
    export MQTT_USER=piloa MQTT_PASS=...
    python tts_offline/mqtt_loa.py
"""
import json
import os
import socket
import sys
import threading
import time
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler

try:
    import paho.mqtt.client as mqtt
except ImportError:
    sys.exit("Thiếu thư viện MQTT. Cài: pip install paho-mqtt")

try:
    from .noi_piper import BoDoc, LoiPiper
    from .tu_vung import cau_thong_bao, cau_thong_bao_ra
except ImportError:
    from noi_piper import BoDoc, LoiPiper
    from tu_vung import cau_thong_bao, cau_thong_bao_ra

# ---------------------------------------------------------------------------
# Cấu hình (đọc từ biến môi trường để khỏi hard-code mật khẩu vào code)
# ---------------------------------------------------------------------------
MQTT_HOST = os.environ.get('MQTT_HOST', 'localhost')
MQTT_PORT = int(os.environ.get('MQTT_PORT', '8883'))
MQTT_USER = os.environ.get('MQTT_USER', '')
MQTT_PASS = os.environ.get('MQTT_PASS', '')
MQTT_TLS = os.environ.get('MQTT_TLS', '1') != '0'   # 1 = TLS (8883), 0 = trần (1883, chỉ test LAN)

# Cổng HTTP để ESP32 tải WAV về. Pi tự đoán IP LAN; đặt LOA_HTTP_HOST nếu đoán sai.
HTTP_PORT = int(os.environ.get('LOA_HTTP_PORT', '8080'))
HTTP_HOST = os.environ.get('LOA_HTTP_HOST', '')     # để trống = tự đoán IP LAN

# Thư mục chứa WAV đã render (được HTTP server phục vụ).
THU_MUC_WAV = os.environ.get(
    'LOA_WAV_DIR', os.path.join(os.path.expanduser('~'), '.cache', 'loa_tts')
)

# Topic
TOPIC_ANNOUNCE = 'smartparking/announce'
TOPIC_AUDIO_FMT = 'smartparking/gate/{gate}/audio'
TOPIC_STATUS = 'smartparking/pi/status'

# Giữ tối đa ngần này file WAV gần nhất rồi xoá bớt (đỡ đầy thẻ nhớ).
GIU_TOI_DA_WAV = 40


def _doan_ip_lan():
    """Đoán IP LAN của Pi bằng cách 'mở' một socket UDP (không thực sự gửi gói nào)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except OSError:
        return '127.0.0.1'
    finally:
        s.close()


def _don_wav_cu(thu_muc, giu):
    """Xoá bớt các file .wav cũ nhất, chỉ giữ `giu` file mới nhất."""
    try:
        files = [os.path.join(thu_muc, f) for f in os.listdir(thu_muc) if f.endswith('.wav')]
        files.sort(key=os.path.getmtime, reverse=True)
        for f in files[giu:]:
            try:
                os.remove(f)
            except OSError:
                pass
    except OSError:
        pass


class CauLoa:
    """Gói toàn bộ: model Piper + HTTP server + client MQTT."""

    def __init__(self):
        os.makedirs(THU_MUC_WAV, exist_ok=True)
        print(f"[loa] Nạp model Piper...")
        self.bo_doc = BoDoc()               # nạp 1 lần, ~1s (LoiPiper nếu đường dẫn/giọng sai)
        self.http_host = HTTP_HOST or _doan_ip_lan()
        self._dem = 0
        self._lock = threading.Lock()
        self._khoi_dong_http()

        self.client = mqtt.Client(client_id=f"pi-loa-{os.getpid()}")
        if MQTT_USER:
            self.client.username_pw_set(MQTT_USER, MQTT_PASS)
        if MQTT_TLS:
            self.client.tls_set()           # dùng CA hệ thống; broker cloud có cert hợp lệ
        self.client.will_set(TOPIC_STATUS, json.dumps({"event": "offline"}), qos=1, retain=True)
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message

    def _khoi_dong_http(self):
        handler = partial(SimpleHTTPRequestHandler, directory=THU_MUC_WAV)
        self.httpd = HTTPServer(('0.0.0.0', HTTP_PORT), handler)
        t = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        t.start()
        print(f"[loa] HTTP phục vụ WAV tại http://{self.http_host}:{HTTP_PORT}/  (thư mục {THU_MUC_WAV})")

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"[loa] Đã nối MQTT {MQTT_HOST}:{MQTT_PORT}")
            client.subscribe(TOPIC_ANNOUNCE, qos=1)
            client.publish(TOPIC_STATUS, json.dumps({"event": "online"}), qos=1, retain=True)
        else:
            print(f"[loa] Nối MQTT thất bại, rc={rc}")

    def _on_message(self, client, userdata, msg):
        """Nhận yêu cầu đọc -> render -> publish URL. Bọc try để 1 gói lỗi không giết client."""
        try:
            data = json.loads(msg.payload.decode('utf-8'))
        except (ValueError, UnicodeDecodeError):
            print(f"[loa] Bỏ qua gói không phải JSON trên {msg.topic}")
            return

        gate = str(data.get('gate', 'in')).lower()
        plate = data.get('plate', '')
        slot = data.get('slot', None)
        if not plate:
            print(f"[loa] Gói announce thiếu 'plate': {data}")
            return

        try:
            # Có slot -> câu VÀO (đọc ô). Không slot -> câu RA.
            if slot not in (None, '', 'null'):
                cau = cau_thong_bao(plate, slot)
            else:
                cau = cau_thong_bao_ra(plate)
        except Exception as e:
            print(f"[loa] Không dựng được câu cho {data}: {e}")
            return

        with self._lock:
            self._dem += 1
            ten = f"tb_{int(time.time())}_{self._dem}.wav"
            duong_dan = os.path.join(THU_MUC_WAV, ten)
            t0 = time.time()
            try:
                _, giay = self.bo_doc.doc_cau_ra_file(cau, duong_dan)
            except Exception as e:
                print(f"[loa] Piper render lỗi: {e}")
                return
            _don_wav_cu(THU_MUC_WAV, GIU_TOI_DA_WAV)

        url = f"http://{self.http_host}:{HTTP_PORT}/{ten}"
        topic = TOPIC_AUDIO_FMT.format(gate=gate)
        client.publish(topic, json.dumps({"url": url, "text": cau}), qos=1)
        print(f'[loa] "{cau}" -> {url} ({giay:.2f}s, render {(time.time()-t0)*1000:.0f}ms) -> {topic}')

    def chay(self):
        # Vòng lặp reconnect: mất mạng thì thử lại, không thoát hẳn.
        while True:
            try:
                self.client.connect(MQTT_HOST, MQTT_PORT, keepalive=30)
                self.client.loop_forever()
            except (OSError, mqtt.MQTTException) as e:
                print(f"[loa] Mất kết nối MQTT ({e}); thử lại sau 5s...")
                time.sleep(5)


def main():
    try:
        CauLoa().chay()
    except LoiPiper as e:
        sys.exit(str(e))
    except KeyboardInterrupt:
        print("\n[loa] Dừng.")


if __name__ == '__main__':
    main()
