# Hướng dẫn Triển khai Hệ thống lên Máy chủ GPU RunPod

Để triển khai được hệ thống này lên một dịch vụ Cloud hỗ trợ GPU như RunPod, bạn cần đóng gói dự án thông qua Docker. Tôi đã giúp bạn tạo sẵn toàn bộ các file `Dockerfile` trong từng thư mục và file cấu hình tổng `docker-compose.yml`. 

Bạn chỉ cần thực hiện theo các bước sau:

---

## Phần 1: Mua và Thiết lập Server trên RunPod

**1. Đăng ký và nạp tiền (Billing):**
- Truy cập [RunPod.io](https://www.runpod.io/) và tạo tài khoản.
- Nạp sẵn một số tiền nhỏ (VD: $25) thông qua thẻ Visa/MasterCard ở mục **Billing**. Máy chủ sẽ tính tiền theo giờ thuê.

**2. Khởi tạo Pod (Server):**
- Chuyển sang mục **Pods** -> Chọn **+ Deploy**.
- Chọn **Secure Cloud** (Khuyến nghị để đảm bảo an toàn dữ liệu) hoặc **Community Cloud** (Rẻ hơn).
- Lựa chọn GPU: 
  - Nếu chỉ test nhẹ: Chọn **RTX 3090** hoặc **RTX A4000** (~ $0.3 - $0.4 / giờ).
  - Chọn nút **Deploy**.
- Thiết lập Template & Thông số:
  - Ở mục **Select a Template**, chọn **RunPod PyTorch** (phiên bản mới nhất có sẵn Ubuntu, Python, Docker và driver GPU).
  - Mở rộng mục **Customize Deployment**:
    - **Expose HTTP Ports**: Nhập `3000, 4000, 5001`. (Để mở mạng ra ngoài cho Frontend, Backend, và Flask).
    - **Container Disk**: Khoảng `50 GB` trở lên để chứa file model.
    - **Volume Disk**: Khoảng `50 GB` trở lên.
  - Bấm **Continue** -> **Deploy**.

**3. Kết nối vào Server:**
- Đợi 2-3 phút để máy chủ khởi động (Trạng thái chuyển sang *Running*).
- Bấm vào nút **Connect** ở giao diện Pod. 
- Tại đây, bạn sẽ thấy câu lệnh SSH (VD: `ssh root@xx.xx.xx.xx -p 12345`). Bạn copy câu lệnh đó để dán vào Terminal/CMD trên máy tính của bạn hoặc sử dụng trực tiếp **Web Terminal** mà RunPod cung cấp.

---

## Phần 2: Đưa Code lên Server và Chạy

**1. Clone dự án lên RunPod:**
Sau khi kết nối vào màn hình Terminal của RunPod, hãy tải code về máy chủ đó (Bạn có thể dùng Git clone hoặc zip file code hiện tại rồi dùng lệnh `scp` đẩy lên).
```bash
git clone <link-github-cua-du-an>
cd swp391-su26-ai-audit-project...
```

**2. Thiết lập Môi trường:**
Hệ thống sử dụng Docker Compose, do đó bạn cần đổi IP kết nối Frontend sang IP của máy chủ RunPod. 
- Mở file `docker-compose.yml` (đã được tạo sẵn).
- Tại service `frontend`, tìm và thay thế `your_runpod_ip` bằng **Địa chỉ IP / Link HTTP Proxy** thực tế do RunPod cấp cho bạn ở mục Connect.

**3. Khởi chạy toàn bộ hệ thống bằng Docker:**
Tại thư mục gốc của dự án (nơi chứa file `docker-compose.yml`), chạy câu lệnh sau:
```bash
# Cài đặt docker-compose (Nếu RunPod chưa cài sẵn)
apt install docker-compose -y

# Xây dựng và khởi chạy các module (Backend, Frontend, AI, MongoDB, Redis)
docker-compose up -d --build
```

**4. Theo dõi và Giám sát:**
Quá trình Build sẽ mất khoảng 5-10 phút (vì cài các thư viện AI nặng như Torch, OpenCV). Sau đó, bạn có thể kiểm tra trạng thái bằng lệnh:
```bash
docker-compose ps
```
Để xem log của module AI (Computer Vision):
```bash
docker logs -f computer-vision
```

---

## Về Các Cấu Hình Đã Được Viết

Tôi đã tự động tạo cho bạn các file sau ngay trong Source Code này:

1. **`src/backend/Dockerfile`**: Đóng gói môi trường Node.js.
2. **`src/frontend/Dockerfile`**: Đóng gói Next.js và tự động biên dịch `npm run build` trước khi chạy.
3. **`src/computer-vison/Dockerfile`**: Sử dụng base image là `pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime` để kích hoạt chế độ tính toán bằng Card Đồ họa rời (GPU), giúp quét cam cực kỳ nhanh.
4. **`docker-compose.yml`**: Nằm ở thư mục gốc, chịu trách nhiệm khởi động đồng loạt Frontend, Backend, AI Module, cùng với cơ sở dữ liệu MongoDB và Redis. File này cũng chứa thẻ `driver: nvidia` để passthrough (cấp quyền) GPU từ máy thật của RunPod vào trong Container của AI.
