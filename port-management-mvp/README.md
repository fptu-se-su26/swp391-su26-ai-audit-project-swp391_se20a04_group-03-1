# LogiPort - Port Management MVP

Monorepo cho hệ thống quản lý vận hành cảng (Port Operations Management).

## Cấu trúc thư mục

```text
port-management-mvp/
├── frontend-apps/                  # Chứa toàn bộ giao diện
│   ├── admin-dashboard/            # (React/Next) Dành cho Quản trị viên cảng
│   │   ├── src/pages/              # Dashboard, Config Quota, Báo cáo Dwell Time
│   │   └── src/components/         # Biểu đồ, Bảng biểu thống kê
│   │
│   ├── client-web/                 # (React/Next) Dành cho Nhà xe / Hãng vận tải
│   │   ├── src/pages/              # Đăng nhập, Quản lý Xe, Tạo Booking
│   │   └── src/components/         # Form Booking, Chọn Time-slot
│   │
│   └── driver-pwa/                 # (React PWA) Dành cho Tài xế
│       ├── src/pages/              # Hiển thị QR Code, Tọa độ bãi, Nút xác nhận bãi
│       └── public/                 # Manifest, Service Worker để chạy Offline/Cài app
│
├── backend-core/                   # (NodeJS/NestJS) Xử lý toàn bộ logic nghiệp vụ
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/               # Xác thực JWT, Phân quyền (Admin/Nhà xe/Tài xế)
│   │   │   ├── tas/                # Logic đặt lịch, Quota, Sinh QR Code
│   │   │   ├── yard/               # Logic quản lý cấu trúc Block-Bay-Row-Tier
│   │   │   ├── gate/               # Logic Check-in/Check-out, đối chiếu Booking
│   │   │   └── e-eir/              # Logic sinh file PDF và lưu trữ EIR
│   │   ├── shared/                 # Utils, Notification (Email/SMS/Push)
│   │   └── database/               # Migrations, Models (PostgreSQL/Prisma/TypeORM)
│   └── Dockerfile
│
├── ai-anpr-service/                # (Python/FastAPI) Service nhận diện biển số
│   ├── app/
│   │   ├── models/                 # Chứa file weight của YOLO (.pt)
│   │   ├── core/                   # Xử lý ảnh, cắt biển số, chạy OCR
│   │   └── api/                    # Endpoint /predict nhận ảnh trả về string biển số
│   ├── requirements.txt
│   └── Dockerfile
│
└── infrastructure/                 # Cấu hình DevOps, Server
    ├── docker-compose.yml          # Dựng toàn bộ hệ thống ở local với 1 lệnh
    └── nginx.conf                  # Cấu hình Proxy
```

## Chạy local

```bash
cd infrastructure
docker compose up -d
```
