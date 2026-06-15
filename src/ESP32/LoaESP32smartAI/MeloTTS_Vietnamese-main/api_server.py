import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import torch
from melo.api import TTS
import os

app = FastAPI(title="MeloTTS Vietnamese ESP32 Server")

# Khởi tạo mô hình AI 1 lần duy nhất trên Server
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"Khởi động AI trên thiết bị: {device}")
model = TTS(language="VI", device=device, config_path="models/config.json", ckpt_path="models/G_model.pth")
speaker_id = 0

@app.post("/generate-tts/")
async def generate_tts(file: UploadFile = File(...)):
    # Nhận file txt và lấy ra nội dung
    content = await file.read()
    text = content.decode("utf-8").strip()
    
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

if __name__ == "__main__":
    import uvicorn
    # Chạy server trên mọi giao diện mạng ở cổng 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
