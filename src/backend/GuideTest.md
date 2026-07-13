# Hướng Dẫn Chạy & Viết Test Của Dự Án (Unit Test & Integration Test)

Tài liệu này (`GuideTest.md`) được tạo ra nhằm hướng dẫn chi tiết cách chạy Test và duy trì các file test trong toàn bộ dự án của chúng ta. Dự án hiện tại áp dụng hai loại kiểm thử tự động:
1. **Unit Test:** Dùng để kiểm thử độc lập hàm/controller (Sử dụng `node-mocks-http`).
2. **Integration Test:** Dùng để kiểm thử luồng API và kết nối Database ảo (Sử dụng `Supertest` + `MongoMemoryServer`).

---

## 1. Môi Trường & Cài Đặt

Dự án sử dụng công cụ **Jest** làm framework chính. Vì toàn bộ code được viết bằng TypeScript nên ta có sử dụng thêm **ts-jest**.

- Lệnh cài đặt (chỉ dành cho người mới clone code):
  ```bash
  cd src/backend
  npm install
  ```

---

## 2. Cách Chạy Các Bài Kiểm Thử

Mở terminal và di chuyển vào thư mục `src/backend`:

- **Chạy toàn bộ test suite (cả Unit và Integration):**
  ```bash
  npm run test
  # hoặc
  npx jest
  ```

- **Chạy test và hiển thị báo cáo Line Coverage (mức độ bao phủ mã nguồn):**
  Lệnh này cực kỳ quan trọng dùng để đo lường xem các test case đã "phủ" được bao nhiêu % code thật.
  ```bash
  npx jest --coverage
  ```
  *Mẹo: Mở file `coverage/lcov-report/index.html` lên bằng trình duyệt, bạn sẽ thấy chi tiết giao diện màu xanh (đã test) và màu đỏ (chưa được chạy tới) của file code gốc.*

- **Chạy riêng test cho AuthController (login / register / logout / forgot / reset):**
  ```bash
  npm run test:auth
  ```
  Đo coverage riêng cho `controllers/auth.controller.ts` (báo cáo tại
  `coverage/auth/index.html`). Hiện đạt **100%** line/branch/statement.

- **Chạy dummy/sample test (kiểm tra nhanh môi trường Jest):**
  ```bash
  npm run test:sample
  ```

---

## 2.1. Các Script Test & Config Tách Biệt

Ngoài `jest.config.js` chính, dự án có thêm vài **config Jest riêng** để chạy độc
lập một nhóm test mà không dính ràng buộc coverage của suite chính:

| Script | Config | Mục đích |
| --- | --- | --- |
| `npm run test` | `jest.config.js` | Chạy toàn bộ suite (Unit + Integration). |
| `npm run test:auth` | `jest.auth.config.js` | Chỉ chạy `tests/auth.controller.test.ts`, đo coverage riêng cho `auth.controller.ts` (ngưỡng ≥ 80%). |
| `npm run test:sample` | `jest.sample.config.js` | Chỉ chạy `tests/sample.dummy.test.ts` (dummy, không đo coverage). |

**Vì sao tách config `test:auth` / `test:sample`?**
`jest.config.js` chính bật `collectCoverage` + `coverageThreshold 80%` giới hạn trên
một số file nghiệp vụ cụ thể. Nếu chạy lẻ một file test qua config chính, coverage
sẽ không đạt ngưỡng và báo đỏ dù test PASS. Các config riêng giúp mỗi nhóm test
chạy sạch và đo đúng phạm vi của nó.

### Biến môi trường test — `.env.test`

Các config trên nạp biến môi trường từ **`.env.test`** (thay cho `.env`). File này
được **gitignore** (mỗi máy tự giữ). Sau khi clone, copy từ template:

```bash
# tại thư mục src/backend
cp .env.test.example .env.test         # Bash
# Copy-Item .env.test.example .env.test    # PowerShell
```

> Chỉ đặt **giá trị giả** trong `.env.test` (test dùng `MongoMemoryServer` và mock
> Redis nên không cần DB/secret thật).

---

## 3. Hướng Dẫn Viết Unit Test (node-mocks-http)

**Mục đích:** Test siêu nhanh logic của Controller mà không chạy Express. Phù hợp với các hàm tính toán, điều kiện if/else phức tạp.

### a) Mock Request & Response (Mô phỏng API Request)
Sử dụng thư viện `node-mocks-http`:
```typescript
import { createRequest, createResponse } from 'node-mocks-http';

// Tạo giả lập Request với body mong muốn
const req = createRequest({ body: { text: '29A12345', type: 'plate', status: 'in' } });
const res = createResponse();

// Gọi hàm
await scanPost(req, res);

// Kiểm tra JSON trả về
expect(res._getJSONData().code).toBe('success');
```

### b) Mock Fake Timers (Kiểm soát Thời gian Hệ Thống)
```typescript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2023-10-10T10:00:00+07:00'));
});
jest.advanceTimersByTime(65000); // Tua đi 65s
```

---

## 4. Hướng Dẫn Viết Integration Test (Supertest)

**Mục đích:** Test một luồng hoàn chỉnh từ lúc gửi Request HTTP (phải đi qua Middleware) cho đến lúc lưu xuống DB ảo, giúp đảm bảo các component liên kết với nhau chuẩn xác. Đặt đuôi file là `.api.test.ts` hoặc `.integration.test.ts`.

### a) Khởi tạo Express App Ảo và DB Ảo (MongoMemoryServer)
Chúng ta KHÔNG được gọi vào Database thật (mongodb://localhost:27017/...). File test chuẩn phải thiết lập MongoDB trên RAM:

```typescript
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import rootRouter from '../routers/index.route';

const app = express();
app.use(express.json());
app.use('/api', rootRouter); // Gắn route cần test

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

### b) Viết Test Case với Supertest
Việc test sẽ giống như bạn gọi API thực tế trên Postman, sau đó kiểm tra dữ liệu dưới DB:

```typescript
it('Nên trả về success khi tạo data', async () => {
  // 1. Arrange: Chuẩn bị DB giả
  await Appointment.create({ truckPlate: "29A11111" });

  // 2. Act: Gắn body vào Request Supertest
  const response = await request(app)
    .post('/api/appointments/create')
    .send({ truckPlate: "29A11111" });

  // 3. Assert: Kiểm tra HTTP Status & Data trả về
  expect(response.status).toBe(200);
  expect(response.body.code).toBe('error'); // Trả error do đã tồn tại
});
```
---

## 5. Những Lỗi Thường Gặp (Troubleshooting)

1. **Lỗi Timeout Mongoose (`MongooseError: Operation buffering timed out`)**:
   - Lý do: Bạn trỏ test file vào DB thật nhưng hệ thống chưa có sẵn DB đó, hoặc bạn quên gọi `MongoMemoryServer`.
   - Khắc phục: Sử dụng `MongoMemoryServer` như hướng dẫn ở mục 4.
2. **Lỗi `TypeError: xxx is not a function` (Unit Test)**: 
   - Khắc phục: Do bạn quên mock hàm của DB khi test độc lập. Sử dụng `(Model.hàm_đó as jest.Mock).mockResolvedValue(0);`
3. **Múi giờ**:
   - Hãy set `+07:00` trong `new Date('...+07:00')` tại các bài test, tránh trường hợp máy local của Dev và máy ảo CI/CD chạy khác múi giờ gây sai lệch.
