# -*- coding: utf-8 -*-
"""
Tạo câu thông báo điều phối bằng cách GHÉP các mẩu WAV đã render sẵn — CHẠY TRÊN PI 5.

Không cần torch / transformers / MeloTTS / phobert / byT5: chỉ đọc các file trong
chunks/ rồi nối lại. Mất vài mili-giây và gần như không tốn CPU, nên không tranh
core với Hailo và 2 worker OCR của computer-vison.

Sinh thư mục chunks/ bằng tao_chunks.py trên laptop (xem README_TTS.md).

Dùng như thư viện:
    from tts_offline.thong_bao import tao_thong_bao, phat
    tao_thong_bao("51A-12345", 3, "thong_bao.wav")

Hoặc dòng lệnh:
    python tts_offline/thong_bao.py --bien_so 51A-12345 --o_so 3 --phat
"""
import argparse
import os
import shutil
import subprocess
import sys

# Chạy được cả khi import như package lẫn khi gọi thẳng bằng python thong_bao.py
try:
    from .tu_vung import danh_sach_chunk
    from .wav_utils import LoiWav, ghep_wav, ghi_wav, thoi_luong_giay
except ImportError:
    from tu_vung import danh_sach_chunk
    from wav_utils import LoiWav, ghep_wav, ghi_wav, thoi_luong_giay

THU_MUC_CHUNK = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chunks')


def duong_dan_cac_chunk(bien_so, o_so, thu_muc_chunk=THU_MUC_CHUNK):
    """
    Biển số + số ô -> danh sách đường dẫn WAV cần ghép.

    Báo lỗi liệt kê rõ mẩu nào thiếu, vì thiếu mẩu mà vẫn ghép thì câu thông báo sẽ
    bị cụt một cách âm thầm — kiểu lỗi rất khó phát hiện khi chạy thật ngoài cổng.
    """
    ma_chunks = danh_sach_chunk(bien_so, o_so)

    duong_dans, thieu = [], []
    for ma in ma_chunks:
        p = os.path.join(thu_muc_chunk, ma + '.wav')
        if os.path.exists(p):
            duong_dans.append(p)
        else:
            thieu.append(ma)

    if thieu:
        raise LoiWav(
            "Thiếu mẩu WAV: " + ", ".join(thieu)
            + f"\nThư mục đang tìm: {thu_muc_chunk}"
            + "\nChạy tao_chunks.py trên laptop để sinh, rồi commit + pull về Pi."
        )
    return duong_dans


def tao_thong_bao(bien_so, o_so, duong_dan_ra, thu_muc_chunk=THU_MUC_CHUNK,
                  khoang_lang_giay=0.06):
    """
    Ghép câu "xe có biển số ... di chuyển vào ô số ..." rồi ghi ra file WAV.

    Trả về (duong_dan_ra, thời lượng giây).
    """
    duong_dans = duong_dan_cac_chunk(bien_so, o_so, thu_muc_chunk)
    params, frames = ghep_wav(duong_dans, khoang_lang_giay)
    ghi_wav(duong_dan_ra, params, frames)
    return duong_dan_ra, thoi_luong_giay(frames, params)


def phat(duong_dan):
    """Phát file WAV ra loa của Pi. Trả về False nếu máy không có aplay/paplay."""
    for lenh in (['aplay', '-q', duong_dan], ['paplay', duong_dan]):
        if shutil.which(lenh[0]):
            subprocess.run(lenh, check=False)
            return True
    return False


def main():
    p = argparse.ArgumentParser(
        description="Tạo thông báo xe vào ô bằng cách ghép mẩu WAV có sẵn (không cần AI)."
    )
    p.add_argument('--bien_so', default='51A-12345', help='Biển số xe (VD: 51A-12345)')
    p.add_argument('--o_so', type=int, default=1, help='Số ô cần đọc (VD: 3)')
    p.add_argument('--ra', default=None, help='File WAV xuất ra (mặc định: thong_bao_<biển số>.wav)')
    p.add_argument('--thu_muc_chunk', default=THU_MUC_CHUNK, help='Thư mục chứa các mẩu WAV')
    p.add_argument('--khoang_lang', type=float, default=0.06,
                   help='Khoảng lặng chèn giữa các mẩu, tính bằng giây')
    p.add_argument('--phat', action='store_true', help='Phát luôn ra loa sau khi tạo')
    args = p.parse_args()

    ra = args.ra or f"thong_bao_{args.bien_so}.wav".replace('-', '_').replace(' ', '')

    try:
        duong_dan, giay = tao_thong_bao(
            args.bien_so, args.o_so, ra, args.thu_muc_chunk, args.khoang_lang
        )
    except LoiWav as e:
        sys.exit(f"LỖI: {e}")

    print(f"Đã tạo: {duong_dan}  ({giay:.2f}s)")

    if args.phat and not phat(duong_dan):
        print("Không tìm thấy aplay/paplay để phát — cài bằng: sudo apt install alsa-utils")


if __name__ == '__main__':
    main()
