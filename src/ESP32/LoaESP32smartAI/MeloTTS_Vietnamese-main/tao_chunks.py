#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Render sẵn TOÀN BỘ mẩu WAV bằng MeloTTS — CHẠY MỘT LẦN TRÊN LAPTOP, KHÔNG chạy trên Pi 5.

Vì sao lại làm vậy: câu thông báo của hệ thống là template với từ vựng đóng
(10 chữ số + 26 chữ cái + 2 cụm cố định + số ô), nên không cần chạy TTS lúc vận hành.
Render trước một lần rồi Pi chỉ việc nối WAV -> nhanh tức thì, không tốn CPU, và
Pi khỏi phải cài torch/transformers/phobert/byT5 (~2GB) vốn sẽ tranh core với OCR.

Yêu cầu (chỉ trên laptop):
  - Cài được MeloTTS: pip install -e .
  - Có models/config.json và models/G_model.pth
    (models/ nằm trong .gitignore nên KHÔNG có sẵn trong repo — tự chép vào)

Chạy:
    python tao_chunks.py                     # sinh vào tts_offline/chunks/
    python tao_chunks.py --so_o_toi_da 100   # bãi có tới 100 ô
    python tao_chunks.py --lam_lai           # render đè lên các mẩu đã có

Kết quả chỉ vài MB -> commit thẳng vào git để Pi chỉ cần `git pull`, khỏi chép tay.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tts_offline.tu_vung import SO_O_TOI_DA, tat_ca_chunk
from tts_offline.wav_utils import cat_khoang_lang, doc_wav, ghi_wav, thoi_luong_giay


def main():
    p = argparse.ArgumentParser(description="Sinh sẵn mẩu WAV cho thông báo điều phối.")
    p.add_argument('--thu_muc_ra', default=os.path.join('tts_offline', 'chunks'))
    p.add_argument('--so_o_toi_da', type=int, default=SO_O_TOI_DA,
                   help=f'Số ô lớn nhất cần đọc (mặc định {SO_O_TOI_DA})')
    p.add_argument('--config', default=os.path.join('models', 'config.json'))
    p.add_argument('--ckpt', default=os.path.join('models', 'G_model.pth'))
    p.add_argument('--speed', type=float, default=1.0)
    p.add_argument('--lam_lai', action='store_true', help='Render lại cả mẩu đã có')
    args = p.parse_args()

    for f in (args.config, args.ckpt):
        if not os.path.exists(f):
            sys.exit(
                f"Không thấy {f}\n"
                f"Thư mục models/ nằm trong .gitignore nên checkpoint không có sẵn trong repo.\n"
                f"Chép config.json + G_model.pth của MeloTTS tiếng Việt vào models/ rồi chạy lại."
            )

    import torch
    from melo.api import TTS

    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    print(f"Thiết bị: {device}")
    print("Đang nạp MeloTTS (lần đầu sẽ tải phobert ~540MB + byT5 ~1.2GB)...")
    model = TTS(language='VI', device=device, config_path=args.config, ckpt_path=args.ckpt)

    ds = tat_ca_chunk(args.so_o_toi_da)
    os.makedirs(args.thu_muc_ra, exist_ok=True)
    tong = len(ds)
    print(f"Cần sinh {tong} mẩu vào {args.thu_muc_ra}/\n")

    da_lam, bo_qua, hong = 0, 0, []
    for i, (ma, van_ban) in enumerate(sorted(ds.items()), 1):
        duong_dan = os.path.join(args.thu_muc_ra, ma + '.wav')

        if os.path.exists(duong_dan) and not args.lam_lai:
            bo_qua += 1
            continue

        model.tts_to_file(van_ban, 0, duong_dan, speed=args.speed, quiet=True)

        # Cắt khoảng lặng hai đầu ngay lúc sinh: mỗi lần render MeloTTS đều chèn sẵn
        # im lặng, ghép 10+ mẩu mà không cắt thì câu nghe rời rạc.
        params, frames = doc_wav(duong_dan)
        goc = thoi_luong_giay(frames, params)
        frames = cat_khoang_lang(frames, params)

        if not frames:
            hong.append((ma, van_ban))
            print(f"[{i}/{tong}] ⚠ {ma}: render ra toàn im lặng — bỏ qua")
            continue

        ghi_wav(duong_dan, params, frames)
        da_lam += 1
        print(f'[{i}/{tong}] {ma:12s} "{van_ban}"  {goc:.2f}s -> {thoi_luong_giay(frames, params):.2f}s')

    print(f"\nXong: {da_lam} mẩu mới, {bo_qua} bỏ qua (đã có).")
    if hong:
        print(f"\n⚠ {len(hong)} mẩu render hỏng (toàn im lặng) — cần xem lại:")
        for ma, van_ban in hong:
            print(f"   {ma}: \"{van_ban}\"")
        print("Thử render riêng bằng chay_thu.py để xem MeloTTS đọc cụm đó thế nào.")

    print(f"\nNghe thử trước khi commit:")
    print(f"   python tts_offline/thong_bao.py --bien_so 51A-12345 --o_so 3 --phat")


if __name__ == '__main__':
    main()
