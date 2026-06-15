import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import torch
from melo.api import TTS

# Kiem tra xem may co ho tro GPU khong, neu khong se tu dong dung CPU
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"Dang su dung thiet bi: {device}")

# Duong dan toi thu muc chua models
model = TTS(
    language="VI",
    device=device,
    config_path="models/config.json",
    ckpt_path="models/G_model.pth",
)

def chuyen_ky_tu_sang_tieng_viet(ky_tu):
    mapping = {
        '0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn',
        '5': 'năm', '6': 'sáu', '7': 'bảy', '8': 'tám', '9': 'chín',
        'A': 'a', 'B': 'bê', 'C': 'xê', 'D': 'đê', 'E': 'e', 'F': 'ép',
        'G': 'gờ', 'H': 'hát', 'I': 'y', 'J': 'gi', 'K': 'ca', 'L': 'lờ',
        'M': 'mờ', 'N': 'nờ', 'O': 'o', 'P': 'pê', 'Q': 'quy', 'R': 'rờ',
        'S': 'ét', 'T': 'tê', 'U': 'u', 'V': 'vê', 'W': 'vê đúp', 'X': 'ích',
        'Y': 'y dài', 'Z': 'zét'
    }
    return mapping.get(ky_tu.upper(), ky_tu)

def thong_bao_xe_vao_o(bien_so, o_so=1):
    # Xu ly bien so de am thanh doc tung ky tu: 12A-12345 -> một hai a một hai ba bốn năm
    bien_so_sach = bien_so.replace("-", "").replace(" ", "")
    bien_so_doc = " ".join([chuyen_ky_tu_sang_tieng_viet(c) for c in bien_so_sach])
    o_so_doc = chuyen_ky_tu_sang_tieng_viet(str(o_so))
    
    # Van ban muon doc
    text = f"xe có biển số {bien_so_doc} di chuyển vào ô số {o_so_doc}"
    output_path = "thong_bao_dieu_phoi.wav"

    speaker_id = 0
    print(f"Dang tao giong noi cho cau: '{text}'...")
    # Chay tao giong noi
    model.tts_to_file(text, speaker_id, output_path, speed=1.0, quiet=True)
    
    print(f"Da tao giong noi thanh cong! File am thanh duoc luu tai: {output_path}")

if __name__ == "__main__":
    # Test thu voi bien so 12A-12345
    bien_so = "12A-12345"
    thong_bao_xe_vao_o(bien_so, o_so=1)
