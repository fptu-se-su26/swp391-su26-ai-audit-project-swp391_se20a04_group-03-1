# Hướng Dẫn Chạy & Viết Unit Test Của Dự Án

Tài liệu này (`GuideTest.md`) được tạo ra nhằm hướng dẫn chi tiết cách chạy Unit Test và duy trì các file test trong toàn bộ dự án của chúng ta (sử dụng Jest, node-mocks-http và TypeScript).

---

## 1. Môi Trường & Cài Đặt

Dự án sử dụng công cụ **Jest** làm framework chính để test. Vì toàn bộ code được viết bằng TypeScript nên ta có sử dụng thêm **ts-jest**.

- Nếu có thành viên mới clone code về, chỉ cần chạy lệnh sau tại thư mục `src/backend` để lấy toàn bộ module (kể cả module test):
  ```bash
  npm install
  ```

---

## 2. Cách Chạy Các Bài Kiểm Thử (Unit Test)

Mở terminal và di chuyển vào thư mục `src/backend`:
```bash
cd src/backend
```

- **Chạy toàn bộ test suite:**
  ```bash
  npx jest
  ```

- **Chạy test và hiển thị báo cáo Line Coverage (mức độ bao phủ mã nguồn):**
  Lệnh này cực kỳ quan trọng dùng để đo lường xem các test case đã "phủ" được bao nhiêu % code thật.
  ```bash
  npx jest --coverage
  ```
  *Mẹo: Mở file `coverage/lcov-report/index.html` lên bằng trình duyệt, bạn sẽ thấy chi tiết giao diện màu xanh (đã test) và màu đỏ (chưa được chạy tới) của file code gốc.*

- **Chạy duy nhất một file test cụ thể (Ví dụ: `scan.controller.test.ts`):**
  ```bash
  npx jest tests/scan.controller.test.ts
  ```

---

## 3. Quy Ước Viết Code Test (Kiến trúc Mocking)

Do tiêu chí của chúng ta là **cô lập hoàn toàn**, test KHÔNG được kết nối vào Database thật hay chờ call API thật. Hãy sử dụng 3 chiến thuật giả lập (mocking) dưới đây:

### a) Mock Request & Response (Mô phỏng API Request)
Sử dụng thư viện `node-mocks-http` để gọi hàm controller mà không cần chạy server Express.
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

### b) Mock Mongoose (Database MongoDB)
Thay vì kết nối DB, chúng ta sẽ ép các hàm DB trả về kết quả giả.
```typescript
// Báo cho Jest biết là ta cần giả lập model này
jest.mock('../models/appointment.model');

// Trong Test Case: Ép hàm findOne trả về object giả mong muốn
(Appointment.findOne as jest.Mock).mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue({ truckPlate: '29A12345' }) // <== Data trả về
});
```

### c) Mock Fake Timers (Kiểm soát Thời gian Hệ Thống)
Hệ thống AI Audit phụ thuộc nhiều vào khung giờ hẹn và đếm ngược thời gian chờ Timeout. Do đó, phải luôn "đóng băng" thời gian hệ thống trong Test.
```typescript
beforeEach(() => {
  jest.useFakeTimers();
  // Set thời gian hệ thống ở đúng mốc 10:00:00 sáng
  jest.setSystemTime(new Date('2023-10-10T10:00:00+07:00'));
});

// Tua thời gian đi qua 65 giây để ép lỗi Timeout (áp dụng khi test)
jest.advanceTimersByTime(65000); 
```

---

## 4. Hướng Dẫn Thêm Test Case Cho File Mới

Khi bạn tạo một Controller mới (ví dụ `user.controller.ts`), bạn hãy tạo file test tương ứng theo cấu trúc: `tests/user.controller.test.ts`.

**Cấu trúc chuẩn của một Test File:**
```typescript
import { Request, Response } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';
import { createUser } from '../controllers/user.controller';
import { User } from '../models/user.model';

jest.mock('../models/user.model');

describe('User Controller', () => {
  beforeEach(() => {
    // Luôn dọn dẹp bộ nhớ đệm giả lập trước mỗi TC
    jest.clearAllMocks(); 
  });

  it('TC01: Nên tạo User thành công', async () => {
    const req = createRequest({ body: { name: 'Nam' } });
    const res = createResponse();
    
    (User.prototype.save as jest.Mock).mockResolvedValue(true);

    await createUser(req, res);

    expect(res._getJSONData().code).toBe('success');
  });
});
```

---

## 5. Những Lỗi Thường Gặp (Troubleshooting)

1. **Lỗi `TypeError: GateTransaction.countDocuments is not a function`**: 
   - Lý do: Quên khai báo giả lập cho hàm đó khi dùng `jest.mock`.
   - Khắc phục: Khai báo ngay trên đầu block test `(GateTransaction.countDocuments as jest.Mock).mockResolvedValue(0);`
2. **Nhiễu dữ liệu Cache**:
   - Nếu Controller của bạn lưu biến Cache bằng `IP` hoặc `ID` (như file `scan.controller.ts`), hãy cho mỗi test một ID ngẫu nhiên. Ví dụ bài trước dùng `cameraIp: 'ip1'`, thì bài test sau dùng `cameraIp: 'ip2'` để không xài lại bộ Cache cũ đã lưu trong nhớ.
3. **Múi giờ**:
   - Hãy set `+07:00` trong `new Date('...+07:00')` tại các bài test, tránh trường hợp máy local của Dev và máy ảo CI/CD chạy khác múi giờ gây sai lệch.
