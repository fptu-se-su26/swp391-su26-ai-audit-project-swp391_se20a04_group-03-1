# Container Port Management System - Frontend

## 🏗️ Cấu trúc Project

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   └── admin/
│       ├── layout.tsx          # Admin layout
│       ├── (auth)/             # Authentication pages
│       │   ├── layout.tsx
│       │   └── login/
│       │       └── page.tsx
│       ├── dashboard/          # Dashboard
│       │   └── page.tsx
│       ├── appointments/       # Truck Appointment System
│       │   └── page.tsx
│       ├── gate/              # Gate In/Out Management
│       │   └── page.tsx
│       ├── yard/              # Yard Management
│       │   └── page.tsx
│       ├── containers/        # Container Management
│       │   └── page.tsx
│       ├── lift/              # Lift/Lower Records
│       │   └── page.tsx
│       ├── seal/              # Seal Monitoring (IoT)
│       │   └── page.tsx
│       └── reports/           # Reports & Analytics
│           └── page.tsx
├── components/
│   ├── ui/                     # UI Components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── layout/                 # Layout Components
│       ├── header.tsx
│       ├── sidebar.tsx
│       ├── footer.tsx
│       └── admin-layout.tsx
└── lib/
    └── utils.ts               # Utility functions
```

## 🎯 Các tính năng chính

### 1. **Dashboard** (`/admin/dashboard`)
- Tổng quan số liệu: xe chờ, container, tỷ lệ sử dụng bãi
- Hoạt động gần đây
- Thống kê nhanh
- Trạng thái bãi theo khu

### 2. **Truck Appointment System** (`/admin/appointments`)
- Đặt lịch khung giờ xe vào cảng
- Quản lý lịch hẹn
- Trạng thái duyệt/phê duyệt

### 3. **Gate Management** (`/admin/gate`)
- Check-in/Check-out xe
- Quản lý booking và container
- Nhật ký cổng
- Thống kê: xe vào, xe ra, xe chờ

### 4. **Yard Management** (`/admin/yard`)
- Bản đồ bãi (block/bay/row/tier)
- Trạng thái từng ô đỗ
- Thông tin khu bãi
- Tỷ lệ sử dụng

### 5. **Container Management** (`/admin/containers`)
- Danh sách container
- Loại (20ft/40ft), trạng thái (hàng/rỗng)
- Vị trí và thời gian lưu
- Thống kê số lượng

### 6. **Lift/Lower Records** (`/admin/lift`)
- Quản lý phiếu nâng/hạ container
- Theo dõi tiến độ
- Thông tin thiết bị (Kran)
- Công nhân xử lý

### 7. **Seal Monitoring** (`/admin/seal`)
- Giám sát IoT sensors
- Dữ liệu nhiệt độ & độ ẩm
- Cảnh báo bất thường
- Biểu đồ realtime

### 8. **Reports** (`/admin/reports`)
- Báo cáo xe vào/ra
- Báo cáo bãi
- Báo cáo container
- KPIs và biểu đồ

### 9. **Authentication** (`/admin/auth/login`)
- Đăng nhập
- Trang đăng ký (có thể mở rộng)

## 🚀 Cách sử dụng

### Cài đặt Dependencies
```bash
cd src/frontend
npm install
```

### Chạy Development Server
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

### Build Production
```bash
npm run build
npm start
```

## 🎨 Components

### UI Components
- **Button**: Các biến thể (default, outline, ghost, link, destructive)
- **Card**: Container chính cho nội dung
  - CardHeader
  - CardTitle
  - CardDescription
  - CardContent
  - CardFooter
- **Input**: Input field
- **Label**: Label cho form

### Layout Components
- **Header**: Thanh header với menu và logout
- **Sidebar**: Navigation menu chính
- **Footer**: Footer thông tin
- **AdminLayout**: Layout chính cho admin

## 🎯 Các Routes

| Route | Tên trang | Chức năng |
|-------|-----------|---------|
| `/` | Home | Trang chủ |
| `/admin/auth/login` | Login | Đăng nhập |
| `/admin/dashboard` | Dashboard | Tổng quan |
| `/admin/appointments` | Appointments | Đặt lịch |
| `/admin/gate` | Gate | Quản lý cổng |
| `/admin/yard` | Yard | Quản lý bãi |
| `/admin/containers` | Containers | Quản lý container |
| `/admin/lift` | Lift | Phiếu nâng/hạ |
| `/admin/seal` | Seal | Giám sát niêm phong |
| `/admin/reports` | Reports | Báo cáo |

## 📦 Dependencies Chính

- **Next.js 16.2.6**: React framework
- **React 19.2.4**: UI library
- **Tailwind CSS 4**: Styling
- **class-variance-authority**: Component variants
- **clsx**: Conditional classes
- **tailwind-merge**: Merge Tailwind classes
- **lucide-react**: Icons
- **@radix-ui/react-label**: Accessible labels

## 🛠️ Tùy chỉnh

### Thay đổi màu sắc
Chỉnh sửa `globals.css`:
```css
:root {
  --primary: #003366;
  --secondary: #0066cc;
  /* ... */
}
```

### Thêm pages mới
1. Tạo folder trong `src/app/admin/`
2. Tạo `page.tsx` file
3. Layout sẽ tự động áp dụng

### Thêm components mới
1. Tạo file trong `src/components/`
2. Export component
3. Import ở trang cần sử dụng

## 📱 Responsive Design

Tất cả các trang được thiết kế responsive với:
- Mobile first approach
- Breakpoints: sm, md, lg, xl
- Grid system 12 cột
- Flexible layouts

## 🔐 Security Notes

- Form xác thực cần backend validation
- Bảo vệ tại cấp API không phải UI
- Cần implement authentication proper
- HTTPS cho production

## 📝 Notes

- Các dữ liệu hiện tại là sample/mock data
- Cần kết nối backend API thực tế
- Sidebar collapse trên mobile
- Dark mode support (CSS variables ready)

## 🎓 Tiếp theo

1. Kết nối API backend
2. Implement authentication thực tế
3. Thêm data validation
4. Implement error handling
5. Thêm loading states
6. Test responsive design
7. Performance optimization
