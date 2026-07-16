# -*- coding: utf-8 -*-
"""
Đọc câu thông báo điều phối bằng Piper TTS — CHẠY THẲNG TRÊN PI 5.

Vì sao Piper chứ không phải MeloTTS:
  - Piper đọc NGUYÊN CÂU một lần -> không có mối ghép, âm lượng tự nhiên đồng đều.
    Hướng cũ (render sẵn từng ký tự rồi ghép) đã bỏ: MeloTTS render câu 1 âm tiết ra
    NHIỄU chứ không phải tiếng nói (33/88 mẩu có đỉnh/RMS > 15), nên nghe bị ngắt và
    to nhỏ thất thường. Xem TTS_TIEP_TUC.md.
  - Chỉ cần onnxruntime — thứ Pi đã cài sẵn cho RapidOCR. Không cần torch/transformers
    (~2GB) vốn sẽ tranh core với Hailo + 2 OCR worker.
  - Đo trên laptop x86_64: render câu 3.3s hết 0.11s (RTF 0.03x). Model 63MB.

Cài trên Pi:
    pip install piper-tts
    mkdir -p ~/piper-voices && cd ~/piper-voices
    B=https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vais1000/medium
    curl -LO $B/vi_VN-vais1000-medium.onnx
    curl -LO $B/vi_VN-vais1000-medium.onnx.json
    (đừng dùng `python -m piper.download_voices` — bị treo, curl nhanh hơn nhiều)

Chạy:
    python tts_offline/noi_piper.py --bien_so 51A-12345 --o_so 3 --phat
"""
import argparse
import os
import subprocess
import sys
import wave

try:
    from .tu_vung import SO_O_TOI_DA, cau_thong_bao
except ImportError:
    from tu_vung import SO_O_TOI_DA, cau_thong_bao

# Đường dẫn giọng mặc định. Đổi bằng --giong hoặc biến môi trường PIPER_VOICE.
GIONG_MAC_DINH = os.environ.get(
    'PIPER_VOICE', os.path.expanduser('~/piper-voices/vi_VN-vais1000-medium.onnx')
)

# espeak-ng ghi đường dẫn dữ liệu vào buffer path_home CHỈ 160 byte
# (snprintf(path_home, 0xa0, ...) trong check_data_path). Đường dẫn tới thư mục piper/
# mà dài quá thì bị cắt cụt -> stat trượt -> espeak lặng lẽ rơi về đường dẫn build cứng
# /project/_skbuild/... rồi chết với lỗi "phontab: No such file or directory".
# Trừ hao ~15 byte cho phần "/espeak-ng-data" mà espeak tự nối thêm.
GIOI_HAN_DUONG_DAN = 145


class LoiPiper(Exception):
    pass


def _kiem_duong_dan_piper():
    """Bắt lỗi buffer 160 byte NGAY, kèm cách sửa — thay vì để espeak báo lỗi phontab khó hiểu."""
    import piper
    thu_muc = os.path.dirname(piper.__file__)
    if len(thu_muc) > GIOI_HAN_DUONG_DAN:
        raise LoiPiper(
            f"Đường dẫn tới piper dài {len(thu_muc)} ký tự, vượt giới hạn {GIOI_HAN_DUONG_DAN}:\n"
            f"  {thu_muc}\n"
            f"espeak-ng chỉ có buffer 160 byte cho đường dẫn dữ liệu, dài hơn là nó cắt cụt rồi\n"
            f"báo lỗi 'phontab: No such file or directory' rất khó lần ra.\n"
            f"Cách sửa: tạo lại venv ở thư mục nông hơn, ví dụ ~/venv-tts."
        )


class BoDoc:
    """
    Giữ model Piper đã nạp sẵn trong RAM.

    Nạp model mất ~1s nên PHẢI tạo object này một lần lúc khởi động rồi dùng lại,
    đừng tạo mới mỗi lần đọc.
    """

    def __init__(self, duong_dan_giong=GIONG_MAC_DINH):
        _kiem_duong_dan_piper()
        if not os.path.exists(duong_dan_giong):
            raise LoiPiper(
                f"Không thấy file giọng: {duong_dan_giong}\n"
                f"Tải về bằng:\n"
                f"  mkdir -p {os.path.dirname(duong_dan_giong)} && cd {os.path.dirname(duong_dan_giong)}\n"
                f"  B=https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vais1000/medium\n"
                f"  curl -LO $B/vi_VN-vais1000-medium.onnx && curl -LO $B/vi_VN-vais1000-medium.onnx.json"
            )

        from piper import PiperVoice
        self.voice = PiperVoice.load(duong_dan_giong)
        self.duong_dan_giong = duong_dan_giong

    def doc_cau_ra_file(self, cau, duong_dan_ra, toc_do=1.0):
        """
        Render MỘT câu tiếng Việt bất kỳ ra file WAV -> (câu, độ_dài_giây).

        Dùng chung cho cả câu vào (có ô) lẫn câu ra (không ô). Piper cho vais1000-medium
        xuất WAV PCM 16-bit, mono, 22050Hz — ESP32 tự đọc sample rate từ header WAV.
        """
        from piper import SynthesisConfig

        # length_scale: >1 chậm lại, <1 nhanh lên (ngược chiều trực giác về "tốc độ").
        cfg = SynthesisConfig(length_scale=1.0 / toc_do if toc_do else 1.0)

        thu_muc = os.path.dirname(os.path.abspath(duong_dan_ra))
        os.makedirs(thu_muc, exist_ok=True)
        with wave.open(duong_dan_ra, 'wb') as w:
            self.voice.synthesize_wav(cau, w, cfg)

        with wave.open(duong_dan_ra, 'rb') as w:
            giay = w.getnframes() / w.getframerate()
        return cau, giay

    def doc_ra_file(self, bien_so, o_so, duong_dan_ra, toc_do=1.0, so_o_toi_da=SO_O_TOI_DA):
        """Render câu thông báo VÀO (biển số + ô) ra file WAV -> (câu, độ_dài_giây)."""
        cau = cau_thong_bao(bien_so, o_so, so_o_toi_da)
        return self.doc_cau_ra_file(cau, duong_dan_ra, toc_do)


def phat(duong_dan):
    """Phát file WAV qua loa. Thử aplay (ALSA) trước, rồi paplay (PulseAudio)."""
    for lenh in (['aplay', '-q', duong_dan], ['paplay', duong_dan]):
        try:
            subprocess.run(lenh, check=True)
            return True
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    print("Không phát được: thiếu cả aplay lẫn paplay. Cài: sudo apt install alsa-utils",
          file=sys.stderr)
    return False


def main():
    p = argparse.ArgumentParser(description="Đọc thông báo điều phối bằng Piper TTS.")
    p.add_argument('--bien_so', required=True)
    p.add_argument('--o_so', type=int, required=True)
    p.add_argument('--ra', default='thong_bao.wav')
    p.add_argument('--giong', default=GIONG_MAC_DINH)
    p.add_argument('--toc_do', type=float, default=1.0, help='1.0 = bình thường, 1.2 = nhanh hơn')
    p.add_argument('--phat', action='store_true', help='Phát luôn sau khi render')
    args = p.parse_args()

    try:
        bo_doc = BoDoc(args.giong)
        cau, giay = bo_doc.doc_ra_file(args.bien_so, args.o_so, args.ra, args.toc_do)
    except LoiPiper as e:
        sys.exit(str(e))

    print(f'Câu: "{cau}"')
    print(f'-> {args.ra}  ({giay:.2f}s)')
    if args.phat:
        phat(args.ra)


if __name__ == '__main__':
    main()
