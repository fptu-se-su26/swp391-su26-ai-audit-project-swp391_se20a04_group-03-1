# TTS thông báo điều phối — chạy trên Pi 5 bằng Piper

> xe có biển số **{từng ký tự}**, di chuyển vào ô số **{số ô}**

Pi 5 tự đọc câu này bằng **Piper TTS** (ONNX). Không cần MeloTTS, không cần torch,
không cần server.

## Cài trên Pi 5

```bash
pip install piper-tts                    # chỉ kéo onnxruntime + pathvalidate

mkdir -p ~/piper-voices && cd ~/piper-voices
B=https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vais1000/medium
curl -LO $B/vi_VN-vais1000-medium.onnx        # 63MB
curl -LO $B/vi_VN-vais1000-medium.onnx.json

sudo apt install alsa-utils                   # nếu chưa có aplay
```

> ⚠️ **Đừng** dùng `python -m piper.download_voices` — nó treo không tải nổi. `curl` mất ~20 giây.

> ⚠️ **Đường dẫn venv phải ngắn.** espeak-ng chỉ có buffer **160 byte** cho đường dẫn dữ
> liệu; dài hơn là nó cắt cụt rồi chết với lỗi `phontab: No such file or directory` cực
> khó lần ra. `~/venv-tts` thì thoải mái; đừng chôn venv vào thư mục lồng sâu.
> `noi_piper.py` tự kiểm tra và báo lỗi rõ ràng nếu vượt.

## Chạy

```bash
python tts_offline/noi_piper.py --bien_so 51A-12345 --o_so 3 --phat
```

Gọi từ code — **nạp model một lần** lúc khởi động rồi dùng lại (nạp mất ~1s):

```python
from tts_offline.noi_piper import BoDoc, phat

bo_doc = BoDoc()                    # MỘT LẦN duy nhất lúc khởi động
cau, giay = bo_doc.doc_ra_file("51A-12345", 3, "/tmp/thong_bao.wav")
phat("/tmp/thong_bao.wav")
```

Đường dẫn giọng lấy từ `--giong`, biến môi trường `PIPER_VOICE`, hoặc mặc định
`~/piper-voices/vi_VN-vais1000-medium.onnx`.

## Vì sao Piper

| | **Piper (đang dùng)** | MeloTTS trên Pi | Ghép chunk (đã bỏ) |
|---|---|---|---|
| Phụ thuộc | onnxruntime (**Pi đã có sẵn cho RapidOCR**) | torch, transformers, librosa… | không có gì |
| Model tải về | **63MB** | ~2.2GB | 0 |
| RAM | **~200MB** | ~3–4GB | ~0 |
| Tạo 1 câu | **0.11s** (RTF 0.03x, đo trên x86_64) | vài giây | ~1ms |
| Ảnh hưởng OCR | Không đáng kể | Tranh 4 core → OCR chậm hẳn | Không |
| Chất lượng | **Liền mạch, đều tiếng** | Liền mạch | **Hỏng — xem dưới** |
| Đọc được câu tuỳ ý | **Có** | Có | Không (chỉ template) |

**Hướng ghép chunk đã bị loại bỏ.** Ý tưởng là render sẵn từng ký tự trên laptop rồi Pi
chỉ nối WAV. Nghe thử thì bị "ngắt quãng" và "vài số nhỏ hơn". Nguyên nhân: **MeloTTS
render câu 1 âm tiết ra NHIỄU chứ không phải tiếng nói** — 33/88 mẩu có đỉnh/RMS > 15
(tiếng nói thật 3–8), trong khi mẩu nhiều âm tiết như `oso_35` ("ba mươi lăm") thì bình
thường (6.4). Đo lại bằng chính thước đo đó: Piper đọc nguyên câu ra **6.0–6.5** ✅.
Chi tiết trong `TTS_TIEP_TUC.md`.

## Cấu trúc

| File | Việc |
|---|---|
| `tts_offline/noi_piper.py` | **Đường chạy chính trên Pi** — Piper đọc nguyên câu → WAV → loa |
| `tts_offline/tu_vung.py` | Từ vựng + quy tắc đọc số tiếng Việt + dựng câu (`cau_thong_bao`) |
| `tts_offline/wav_utils.py` | Đọc/ghi/đo WAV bằng thư viện chuẩn |
| ~~`tao_chunks.py`, `thong_bao.py`, `can_am_luong.py`, `chunks/`~~ | Tàn dư hướng ghép chunk — **có thể xoá** |

## Thêm/sửa từ vựng

Mọi thứ trong `tts_offline/tu_vung.py`, sửa xong chạy được ngay (Piper render lúc chạy,
không phải render sẵn):

- Đổi câu thông báo → `CUM_TU`
- Đổi cách đọc chữ cái → `CHU_CAI`
- Bãi nhiều ô hơn → `SO_O_TOI_DA`

## Lưu ý kỹ thuật

**Đọc biển số:** rời từng ký tự (`"một hai ba"`), **không** đọc thành số nguyên
(`"một trăm hai mươi ba"`) — theo `luu_y.md`. Số ô thì ngược lại, đọc tự nhiên
(`ô số 15` → `"ô số mười lăm"`), xử lý đúng biến âm *mốt/lăm/linh*.

**I và Y:** đọc `"i ngắn"` / `"y dài"` cho khỏi lẫn. Bản cũ đọc `I` thành `"y"`, trùng với `Y`.

**Số ô ≥ 10:** bản gốc bị câm âm thầm — nó gọi hàm tra map theo *1 ký tự*, nên `o_so=12`
tra key `"12"` không thấy rồi trả `"12"` nguyên xi, mà MeloTTS thì bỏ qua chữ số.
`so_sang_chu()` đọc đúng `"mười hai"`.

**`length_scale` ngược chiều trực giác:** trong Piper `length_scale` >1 là *chậm lại*.
`noi_piper.py` nhận `--toc_do` theo chiều thuận rồi tự nghịch đảo.

**Không dùng `audioop`:** module này đã bị **gỡ khỏi Python 3.13** — đúng bản Pi đang chạy.
`wav_utils.py` xử lý mẫu bằng `array` thay thế.
