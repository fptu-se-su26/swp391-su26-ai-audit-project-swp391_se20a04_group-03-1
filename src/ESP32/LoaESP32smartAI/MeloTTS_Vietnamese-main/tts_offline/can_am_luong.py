# -*- coding: utf-8 -*-
"""
Cân âm lượng toàn bộ mẩu WAV về cùng một mức — chạy TRÊN CHUNK ĐÃ CÓ, không cần MeloTTS.

Vì sao cần: MeloTTS render mỗi từ ra một độ to khác nhau. Đo thực tế trên bộ chunk
tiếng Việt: "hai" RMS 638 vs "không" RMS 2645 -> chênh 12.4 dB; cụm "xe có biển số"
RMS 3961, to gấp 6 lần "hai". Ghép thẳng nghe rõ tiếng to tiếng nhỏ, giật cục.

Chạy:
    python tts_offline/can_am_luong.py                      # cân tts_offline/chunks/
    python tts_offline/can_am_luong.py --rms_dich 2500      # to hơn
    python tts_offline/can_am_luong.py --thu_muc /tmp/chunks_1.3
    python tts_offline/can_am_luong.py --chi_xem            # chỉ đo, không sửa file

Chỉ dùng thư viện chuẩn -> chạy được cả trên Pi 5.
"""
import argparse
import glob
import math
import os
import sys

try:
    from .wav_utils import chuan_hoa_am_luong, do_rms, doc_wav, ghi_wav, lam_min_hai_dau
except ImportError:
    from wav_utils import chuan_hoa_am_luong, do_rms, doc_wav, ghi_wav, lam_min_hai_dau

THU_MUC_CHUNK = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chunks')


def thong_ke(thu_muc):
    """Trả về {tên_mẩu: rms} của mọi mẩu trong thư mục."""
    r = {}
    for p in sorted(glob.glob(os.path.join(thu_muc, '*.wav'))):
        params, frames = doc_wav(p)
        r[os.path.basename(p)[:-4]] = do_rms(frames, params)
    return r


def in_do_lech(r, nhan):
    if not r:
        print(f"  {nhan}: không có mẩu nào")
        return
    lon, nho = max(r.values()), min(r.values())
    db = 20 * math.log10(lon / nho) if nho > 0 else float('inf')
    to_nhat = max(r, key=r.get)
    nho_nhat = min(r, key=r.get)
    print(f"  {nhan:8s} to nhất {to_nhat} ({lon:.0f}) | nhỏ nhất {nho_nhat} ({nho:.0f}) "
          f"| chênh {db:.1f} dB")


def main():
    p = argparse.ArgumentParser(description="Cân âm lượng các mẩu WAV về cùng một mức.")
    p.add_argument('--thu_muc', default=THU_MUC_CHUNK)
    p.add_argument('--rms_dich', type=float, default=2200,
                   help='Mức RMS đích (0..32767). Mặc định 2200.')
    p.add_argument('--fade', type=float, default=0.008,
                   help='Vuốt hai đầu mẩu (giây) cho khỏi kêu "tách". 0 = tắt.')
    p.add_argument('--chi_xem', action='store_true', help='Chỉ đo, không ghi đè file')
    args = p.parse_args()

    cac_file = sorted(glob.glob(os.path.join(args.thu_muc, '*.wav')))
    if not cac_file:
        sys.exit(f"Không thấy mẩu WAV nào trong {args.thu_muc}")

    print(f"Thư mục: {args.thu_muc}  ({len(cac_file)} mẩu)\n")
    in_do_lech(thong_ke(args.thu_muc), 'TRƯỚC:')

    if args.chi_xem:
        return

    for duong_dan in cac_file:
        params, frames = doc_wav(duong_dan)
        frames = chuan_hoa_am_luong(frames, params, rms_dich=args.rms_dich)
        if args.fade > 0:
            frames = lam_min_hai_dau(frames, params, giay=args.fade)
        ghi_wav(duong_dan, params, frames)

    in_do_lech(thong_ke(args.thu_muc), 'SAU:')
    print(f"\nĐã cân {len(cac_file)} mẩu về RMS {args.rms_dich:.0f}.")
    print("Nghe thử: python tts_offline/thong_bao.py --bien_so 51A-12345 --o_so 3 --phat")


if __name__ == '__main__':
    main()
