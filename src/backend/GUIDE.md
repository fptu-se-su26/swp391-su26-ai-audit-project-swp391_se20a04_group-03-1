# Hướng Dẫn Chạy & Viết Test Bằng Jest (Node.js/Express)

File hướng dẫn này cung cấp cho bạn cái nhìn tổng quan về cách cài đặt, chạy và duy trì các bài Kiểm thử tự động (Unit Test & Integration Test) trong dự án Backend. Mã nguồn hiện tại đang sử dụng **Jest**, **node-mocks-http** và **Supertest**.

---

## 1. Cách Chạy Các Bài Kiểm Thử

Tất cả cấu hình và lệnh test đã được thiết lập sẵn trong thư mục `src/backend`. Mở terminal và trỏ đến thư mục backend của bạn:

```bash
cd D:\SWP\swp391-su26-ai-audit-project-swp391_se20a04_group-03-1\src\backend
```

- **Chạy toàn bộ test suite:**
  ```bash
  npm run test
  # hoặc
  npx jest
  ```
- **Chạy test và hiển thị báo cáo Line Coverage (mức độ bao phủ code):**
  ```bash
  npx jest --coverage
  ```
- **Chạy duy nhất một file test cụ thể:**
  ```bash
  npx jest tests/scan.controller.test.ts
  ```

Sau khi chạy lệnh `--coverage`, Jest sẽ in ra một bảng tổng hợp trên Terminal và đồng thời tạo ra một thư mục `coverage/` chứa trang HTML báo cáo chi tiết.

---

## 2. Hướng Dẫn Viết Unit Test (node-mocks-http)

**Mục đích:** Test siêu nhanh logic của Controller mà không chạy Express.

### a) Mock Request & Response của Express
Sử dụng thư viện `node-mocks-http`:
```typescript
import { createRequest, createResponse } from 'node-mocks-http';

const req = createRequest({ body: { text: '29A12345', type: 'plate' } });
const res = createResponse();
await scanPost(req, res);
```

### b) Mock Mongoose Models (Database)
Thay vì kết nối MongoDB, chúng ta giả lập các hàm `findOne`, `findById`, `save` của Mongoose:
```typescript
jest.mock('../models/appointment.model');
(Appointment.findOne as jest.Mock).mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue({ truckPlate: '29A12345' })
});
```

### c) Mock Fake Timers (Kiểm soát Thời gian)
```typescript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2023-10-10T10:00:00+07:00'));
});
jest.advanceTimersByTime(65000); 
```

---

## 3. Hướng Dẫn Viết Integration Test (Supertest)

**Mục đích:** Test một luồng hoàn chỉnh từ lúc gửi Request HTTP (phải đi qua Middleware) cho đến lúc lưu xuống DB ảo. Đặt đuôi file là `.api.test.ts`.

### a) Khởi tạo Express App Ảo và DB Ảo
File test chuẩn phải thiết lập MongoDB trên RAM:

```typescript
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import rootRouter from '../routers/index.route';

const app = express();
app.use(express.json());
app.use('/api', rootRouter); 

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
```

### b) Bỏ qua Authentication Middleware (Bypass)
```typescript
jest.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => next(),
  requireAuthCompany: (req: any, res: any, next: any) => next(),
  requireAuthProvider: (req: any, res: any, next: any) => next()
}));
```

---

## 4. Một Số Lỗi Thường Gặp Khi Viết Test

1. **Lỗi Timeout Mongoose (`MongooseError: Operation buffering timed out`)**:
   - Lý do: Bạn trỏ test file vào DB thật thay vì dùng DB ảo.
   - Khắc phục: Sử dụng `MongoMemoryServer` như hướng dẫn ở mục 3.
2. **`TypeError: ... is not a function` (Unit Test)**:
   - Khắc phục: Khai báo mock ở trên đầu file hoặc trong `beforeEach`: `(GateTransaction.countDocuments as jest.Mock).mockResolvedValue(0);`
3. **Nhiễu dữ liệu Cache**:
   - Khắc phục: Đối với cache dùng ID/IP làm khóa (như `cameraScanCache`), hãy luôn truyền cho mỗi test case một ID/IP độc nhất (`ip1`, `ip2`...).
