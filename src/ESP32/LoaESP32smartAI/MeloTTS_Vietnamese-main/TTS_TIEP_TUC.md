# TTS — Nhật ký điều tra & quyết định

Cập nhật: 2026-07-15. **Đã chốt hướng: Piper.** Cách dùng xem `README_TTS.md`,
file này chỉ ghi lại *vì sao* để sau khỏi đi lại vết xe đổ.

## ✅ Kết quả cuối

Piper TTS đọc **nguyên câu** trên Pi 5, thay cho hướng ghép chunk đã bỏ.
Đo bằng chính thước đo đã dùng để phát hiện chunk hỏng (đỉnh/RMS, tiếng nói thật 3–8):

| | đỉnh/RMS | RMS |
|---|---|---|
| **Piper, "51A-12345 ô 3"** | **6.0** ✅ | 5490 |
| **Piper, "29B-67890 ô 12"** | **6.5** ✅ | 5065 |
| MeloTTS chunk `kytu_O` | 57.5 ❌ | 546 |
| MeloTTS chunk `oso_3` | 47.3 ❌ | 657 |

Render câu 3.3s hết **0.11s** (RTF 0.03x) trên x86_64. Model 63MB, chỉ cần onnxruntime.
Cả hai lỗi người dùng phàn nàn ("bị ngắt", "vài số nhỏ hơn") đều hết, vì Piper render
một mạch nên không có mối ghép và âm lượng tự nhiên đồng đều.

---

## 🔴 Kết luận quan trọng nhất (tìm ra ngay trước khi dừng)

**MeloTTS render từng ký tự lẻ RA NHIỄU, không phải tiếng nói.** Đây là nguyên nhân thật
của việc nghe "bị ngắt" và "vài số nhỏ hơn" — không phải do thuật toán ghép.

Bằng chứng — `kytu_O.wav` (chữ "o"), phân bố biên độ theo đoạn 10%:

```
  0- 10%  đỉnh= 31397  ████████████████████████████████████████   <- tràng nhiễu
 10- 20%  đỉnh=   349
 20-100%  đỉnh=  240..655                                          <- gần như im lặng
20 mẫu đầu: [15316, -1182, -26088, -14432, 3295, -5733, 10855, ...] <- dao động loạn
```

Quét cả 88 mẩu bằng hệ số **đỉnh/RMS** (tiếng nói thật ~3–8; >15 là nhiễu):

| Nhóm | đỉnh/RMS | Kết luận |
|---|---|---|
| `kytu_H`, `kytu_U`, `kytu_O`, `kytu_N`, `kytu_A`, `kytu_M` | 53–60 | **hỏng nặng** |
| `kytu_2`, `oso_3`, `oso_2`, `kytu_3`, `kytu_E`, `kytu_G` | 40–48 | **hỏng** |
| … tổng cộng **33/88 mẩu** | > 15 | nghi hỏng |
| `oso_35`, `oso_25`, `oso_45` ("ba mươi lăm"…) | 6–7 | **bình thường** |

Quy luật rõ ràng: **mẩu càng ngắn (1 âm tiết) càng hỏng; mẩu nhiều âm tiết thì tốt.**
VITS render câu cực ngắn sinh artifact.

→ **Cách ghép chunk theo TỪNG KÝ TỰ không khả thi với MeloTTS.** Đừng tốn công tinh
chỉnh khoảng lặng / âm lượng nữa, gốc rễ nằm ở đây.

Lưu ý phái sinh: `tts_offline/can_am_luong.py` chạy ra kết quả TỆ HƠN (chênh 19.6 → 25.9 dB)
**chính vì** bug này — bộ chặn đỉnh bị các xung nhiễu ~31000 đánh lừa, tưởng mẩu đã to hết cỡ
nên không khuếch đại, rồi fade lại xoá mất chính tràng nhiễu đó. Code cân âm lượng không sai;
dữ liệu đầu vào mới sai.

---

## Ba hướng đi tiếp (cần chọn)

### 1. Piper TTS — khả thi nhất, đọc nguyên câu nên hết sạch cả 2 lỗi
Đã xác minh:
- Wheel `piper_tts-1.4.2-cp39-abi3-manylinux_2_17_aarch64.whl` → **abi3, chạy thẳng Python 3.13 của Pi, không phải build**
- Phụ thuộc chỉ `onnxruntime<2,>=1` + `pathvalidate` → **Pi đã có onnxruntime sẵn cho RapidOCR**
- `torch` chỉ nằm trong extra `[train]`, không cần
- venv sạch chỉ **167MB** (so với 1.7GB của MeloTTS)
- 3 giọng vi_VN trên `rhasspy/piper-voices`:
  `vi_VN-vais1000-medium` (63MB), `vi_VN-25hours_single-low` (63MB), `vi_VN-vivos-x_low` (28MB)

✅ **ĐÃ CHẠY ĐƯỢC.** Ghi chép trước đó ("wheel hỏng, `initialize` bỏ qua tham số") là **KẾT LUẬN SAI**,
nay đã bác bỏ bằng cách dịch ngược `espeakbridge.so`:

- `py_initialize` nạp `data_dir` vào `%rdx` rồi gọi `espeak_Initialize(2, 0, data_dir, 0)`
  → **tham số ĐƯỢC dùng đàng hoàng**, không hề bị bỏ qua.
- `espeak_ng_InitializePath` thử theo thứ tự: `check_data_path(path)` → `$ESPEAK_DATA_PATH`
  → `$HOME` → cuối cùng mới tới đường dẫn cứng `/project/_skbuild/...`.
- `check_data_path` ghi vào `path_home` bằng `snprintf(path_home, 0xa0, ...)` —
  **buffer chỉ 160 byte**.

**Nguyên nhân thật:** tôi cài venv trong scratchpad, đường dẫn dài **198 ký tự** > 160
→ `snprintf` cắt cụt → `stat` trượt cả 3 nấc → rơi xuống đường dẫn cứng → lỗi `phontab`.
Cài lại y hệt vào `/tmp/pp` (42 ký tự) thì **chạy ngay**, phoneme tiếng Việt chuẩn:

```
p.phonemize('vi', 'xe co bien so nam mot a')
-> sˈɛ kˈɔ baɪˈɛn sˈɔ nˈaːm mˈɔt̪ ˈaː
```

⚠️ **Hệ quả cần nhớ khi cài trên Pi:** đường dẫn tới thư mục `piper/` phải **< ~145 ký tự**.
`/home/pi/...` bình thường thì thoải mái, nhưng đừng chôn venv vào thư mục lồng sâu.
Kiểm tra nhanh: `python -c "import piper,os;print(len(os.path.dirname(piper.__file__)))"`

### 2. MeloTTS chạy thẳng trên Pi 5 — khả thi hơn tưởng ban đầu
Rào cản Python 3.13 **không có thật**. Xem mục "phát hiện về requirements" bên dưới.
Còn lại: ~2GB model, RAM ~3–4GB, tranh 4 core với Hailo + 2 OCR worker.

### 3. MeloTTS trên server backend, Pi/ESP32 gọi HTTP lấy WAV
Đúng kiến trúc gốc mà `api_server.py` + `docs/esp32_integration_guide.md` đã thiết kế.
Pi tốn 0% CPU. Cần mạng.

---

## Phát hiện về requirements (đã kiểm chứng, dùng lại được)

**`transformers==4.27.4` trong `requirements.txt` là thứ chặn MỌI đường** — nó kéo
`tokenizers<0.14`, mà `tokenizers 0.13.3` chỉ có wheel tới **cp311**. Nên fail trên cả
Pi (3.13) lẫn laptop (3.12), buộc build từ Rust.

**Bỏ ghim đó ra thì `transformers 5.13.1` chạy MeloTTS tiếng Việt hoàn toàn bình thường**
(render sạch 88/88 mẩu). Bộ phiên bản đã kiểm chứng nằm trong `requirements-tao-chunks.txt`.

## Model đã có sẵn

`models/G_model.pth` (624MB) + `models/config.json` **đã tải về**, lấy từ HuggingFace
`nmcuong/MeloTTS-Vietnamese` → `pretrain/G_463000.pth` + `pretrain/config.json`.
`README.md` ghi link cũ `MeloTTS_Vietnamese` (gạch dưới), HF đã đổi sang gạch ngang.
`models/` nằm trong `.gitignore` nên **không lọt vào git** — nếu mất thì tải lại:

```python
from huggingface_hub import hf_hub_download
hf_hub_download("nmcuong/MeloTTS-Vietnamese", "pretrain/G_463000.pth")
hf_hub_download("nmcuong/MeloTTS-Vietnamese", "pretrain/config.json")
```

`melo/download_utils.py` **không có mục `'VI'`** → model tiếng Việt vĩnh viễn không tự tải,
bắt buộc truyền `ckpt_path`.

---

## File đã tạo (chưa commit)

| File | Trạng thái |
|---|---|
| `tts_offline/noi_piper.py` | ✅ **Đường chạy chính trên Pi** — Piper đọc nguyên câu. Có chốt chặn độ dài đường dẫn. |
| `tts_offline/tu_vung.py` | ✅ **Dùng được, test 22/22** — từ vựng + đọc số (mốt/lăm/linh) + `cau_thong_bao()` dựng câu cho Piper |
| `tts_offline/wav_utils.py` | ✅ Dùng được — đọc/ghi/đo WAV bằng thư viện chuẩn |
| `README_TTS.md` | ✅ Đã viết lại theo hướng Piper |
| `tts_offline/thong_bao.py` | ⚠️ Tàn dư ghép chunk — **có thể xoá** |
| `tts_offline/can_am_luong.py` | ⚠️ Tàn dư; code đúng nhưng vô dụng vì chunk hỏng |
| `tao_chunks.py` | ⚠️ Tàn dư ghép chunk — **có thể xoá** |
| `tts_offline/chunks/` | ❌ 88 file, 33 hỏng — **ĐỪNG COMMIT**, nên xoá |
| `requirements-tao-chunks.txt` | Chỉ còn giá trị tham khảo (nếu sau này lại cần MeloTTS) |
| `models/G_model.pth` (624MB) | Không còn cần cho Piper. Gitignored. Xoá được nếu chắc bỏ hẳn MeloTTS. |

## Số liệu đã đo

| | Độ dài câu "51A-12345 ô 3" |
|---|---|
| Ghép chunk speed 1.0 | 9.13s |
| Ghép chunk speed 1.3 | 7.41s |
| Ghép chunk speed 1.5 | 6.47s |
| MeloTTS đọc **nguyên câu** (`thong_bao_dieu_phoi.wav`) | **4.65s** |

Ghép chunk chậm gấp đôi vì ký tự lẻ bị đọc rề rà (`"bảy"` 0.71s, trong câu chỉ ~0.25s).

---

## 🔴 Bug bảo mật chưa vá — `api_server.py:96`

```python
def get_audio(filename: str = "ket_qua.wav"):
    return FileResponse(filename, ...)   # filename do client truyền -> path traversal
```
Đọc được file bất kỳ trên Pi: `/etc/passwd`, `.env`, token Cloudflare Tunnel.
**Phải xoá hoặc vá trước khi mở tunnel ra Internet.**

Ngoài ra `api_server.py` dùng `num2words` nên đọc `12345` thành *"mười hai nghìn ba trăm
bốn mươi lăm"*, **trái** `luu_y.md` (phải đọc rời từng ký tự). `tts_offline/tu_vung.py`
đã làm đúng.

## Bug đã sửa trong code cũ

`o_so >= 10` bị câm âm thầm: bản cũ gọi `chuyen_ky_tu_sang_tieng_viet(str(o_so))` — hàm tra
map theo **1 ký tự**, nên `o_so=12` tra key `"12"` không thấy → trả `"12"` nguyên xi → mà theo
`luu_y.md` thì MeloTTS bỏ qua chữ số. `tu_vung.so_sang_chu()` đọc đúng `"mười hai"`.

---

## Chạy tiếp thế nào

Môi trường tạm (`venv-tts`, `venv-piper`, `/tmp/chunks_*`) nằm trong scratchpad **sẽ bị xoá**.
Dựng lại:

```bash
cd src/ESP32/LoaESP32smartAI/MeloTTS_Vietnamese-main
python3 -m venv venv-tts
./venv-tts/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
./venv-tts/bin/pip install -r requirements-tao-chunks.txt
# models/ vẫn còn (624MB, gitignored) — nếu mất thì tải lại theo mục trên
./venv-tts/bin/python tao_chunks.py --lam_lai
```

Kiểm tra chunk hỏng (không cần venv):
```bash
python3 -c "
import sys, glob, os; sys.path.insert(0,'tts_offline')
from wav_utils import doc_wav, do_rms, _lay_mau
for p in sorted(glob.glob('tts_offline/chunks/*.wav')):
    params, fr = doc_wav(p); mau = _lay_mau(fr, params)
    rms = do_rms(fr, params); dinh = max(abs(min(mau)), abs(max(mau)))
    cf = dinh/rms if rms else 999
    if cf > 15: print(f'HỎNG {os.path.basename(p)[:-4]:14s} đỉnh/RMS={cf:.1f}')
"
```

## Việc tiếp theo nên làm

1. **Đi hướng Piper** (hướng 1). Rào cản duy nhất còn lại đã được gỡ: wheel không hỏng,
   chỉ cần cài ở đường dẫn ngắn. Piper đọc **nguyên câu** nên xoá sạch cả hai lỗi người
   dùng phàn nàn ("bị ngắt" + "vài số nhỏ hơn") — vốn đều sinh ra từ việc ghép ký tự lẻ.
2. Vá/xoá `api_server.py` (path traversal, xem trên).
3. Giữ lại `tts_offline/tu_vung.py` — phần chuẩn hoá văn bản (đọc số tiếng Việt
   mốt/lăm/linh, tách ký tự biển số) vẫn cần nguyên vẹn để sinh câu đưa cho Piper.
   `wav_utils.py` vẫn dùng được để phát/đo WAV. Bỏ `thong_bao.py` (ghép chunk),
   `can_am_luong.py`, `tao_chunks.py`, `tts_offline/chunks/` nếu chốt Piper.

Phương án dự phòng nếu vì lý do nào đó phải quay lại ghép chunk: render ký tự
**KÈM NGỮ CẢNH** rồi cắt ra (VD render `"số a."` thay vì `"a"`) để tránh artifact câu
quá ngắn. Chưa thử.
