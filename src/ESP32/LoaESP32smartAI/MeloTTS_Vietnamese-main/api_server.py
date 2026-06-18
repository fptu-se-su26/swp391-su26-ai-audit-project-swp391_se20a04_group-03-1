import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
import torch
from melo.api import TTS
import os
import re

try:
    from num2words import num2words
except ImportError:
    num2words = None

app = FastAPI(title="MeloTTS Vietnamese ESP32 Server")

# Khởi tạo mô hình AI 1 lần duy nhất trên Server
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"Khởi động AI trên thiết bị: {device}")
model = TTS(language="VI", device=device, config_path="models/config.json", ckpt_path="models/G_model.pth")
speaker_id = 0

def normalize_vietnamese(text):
    if not text:
        return text
    
    # Thêm khoảng trắng giữa chữ và số để tách biệt (ví dụ SWP391 -> SWP 391)
    text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
    text = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', text)
    
    letter_map = {
        'A': 'a', 'B': 'bê', 'C': 'xê', 'D': 'đê', 'E': 'e', 'F': 'ép',
        'G': 'gờ', 'H': 'hát', 'I': 'i', 'J': 'gi', 'K': 'ca', 'L': 'lờ',
        'M': 'mờ', 'N': 'nờ', 'O': 'o', 'P': 'pê', 'Q': 'quy', 'R': 'rờ',
        'S': 'ét', 'T': 'tê', 'U': 'u', 'V': 'vê', 'W': 'đắp lưu', 'X': 'ích',
        'Y': 'y dài', 'Z': 'zét'
    }
    
    # 1. Chuyển các từ viết tắt toàn chữ in hoa thành từng chữ cái
    def replace_acronym(match):
        word = match.group(0)
        return " ".join([letter_map.get(c, c) for c in word])
        
    text = re.sub(r'\b[A-Z]{2,}\b', replace_acronym, text)
    
    # 2. Chuyển các chữ cái tiếng Anh đứng một mình
    def replace_single_letter(match):
        c = match.group(0).upper()
        return letter_map.get(c, match.group(0))
        
    text = re.sub(r'\b[a-zA-Z]\b', replace_single_letter, text)
    
    # 3. Đọc số
    def replace_number(match):
        if num2words is not None:
            num_str = match.group(0)
            try:
                # num2words hỗ trợ đọc số tiếng Việt cực chuẩn (vd: 123 -> một trăm hai mươi ba)
                return num2words(int(num_str), lang='vi')
            except:
                return num_str
        else:
            # Fallback đọc từng số nếu chưa cài thư viện num2words
            num_map = {'0':'không','1':'một','2':'hai','3':'ba','4':'bốn','5':'năm','6':'sáu','7':'bảy','8':'tám','9':'chín'}
            return " ".join([num_map.get(c, c) for c in match.group(0)])
            
    text = re.sub(r'\b\d+\b', replace_number, text)
    
    return text

@app.post("/generate-tts/")
async def generate_tts(request: Request):
    # Nhận trực tiếp văn bản từ body của request
    body_bytes = await request.body()
    text = body_bytes.decode("utf-8").strip()
    
    # Chuẩn hoá văn bản (đọc số, đọc chữ cái Latinh)
    text = normalize_vietnamese(text)
    
    # AI tạo file âm thanh từ chữ
    output_path = "ket_qua.wav"
    print(f"Bắt đầu tạo giọng nói cho: {text}")
    model.tts_to_file(text, speaker_id, output_path, speed=1.0, quiet=True)
    
    print("Đã tạo file âm thanh thành công!")
    return {"message": "Thành công", "audio_url": "/get-audio/"}

@app.get("/get-audio/")
def get_audio(filename: str = "ket_qua.wav"):
    # Kiểm tra xem file có tồn tại không
    if not os.path.exists(filename):
        return {"error": "File chưa được tạo hoặc không tồn tại"}
    # Mở liên kết để ESP32 có thể truy cập và tải audio về
    return FileResponse(filename, media_type="audio/wav")

@app.get("/generate-tts-stream/")
def generate_tts_stream(text: str):
    # Chuẩn hoá văn bản
    text = normalize_vietnamese(text)
    
    output_path = "ket_qua.wav"
    print(f"Bắt đầu tạo giọng nói (Stream trực tiếp) cho: {text}")
    model.tts_to_file(text, speaker_id, output_path, speed=1.0, quiet=True)
    
    # Trả về file ngay lập tức
    return FileResponse(output_path, media_type="audio/wav")


if __name__ == "__main__":
    import uvicorn
    # Chạy server trên mọi giao diện mạng ở cổng 8000
    uvicorn.run(app, host="0.0.0.0", port=5004)
