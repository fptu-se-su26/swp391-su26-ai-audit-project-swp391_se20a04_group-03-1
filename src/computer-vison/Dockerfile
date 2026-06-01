FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

# Cài đặt các thư viện hệ thống cần thiết cho OpenCV và các dependencies khác
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirement.txt và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code Python (app.py, thư mục src, models)
COPY . .

# Expose port (mặc định Flask chạy trên 5001)
EXPOSE 5001

# Chạy Flask app (đảm bảo file app.py hoặc main nằm đúng vị trí)
CMD ["python", "src/main.py"]
