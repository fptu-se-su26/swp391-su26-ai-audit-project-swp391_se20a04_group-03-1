# Hướng Dẫn Chạy & Viết Unit Test Bằng Jest (Node.js/Express)

File hướng dẫn này cung cấp cho bạn cái nhìn tổng quan về cách cài đặt, chạy và duy trì các Unit Test trong dự án Backend. Mã nguồn hiện tại đang sử dụng **Jest** và **node-mocks-http** để giả lập các request độc lập hoàn toàn với Database thật.

---

## 1. Cách Chạy Unit Test

Tất cả cấu hình và lệnh test đã được thiết lập sẵn trong thư mục `src/backend`. Mở terminal và trỏ đến thư mục backend của bạn:

```bash
cd D:\SWP\swp391-su26-ai-audit-project-swp391_se20a04_group-03-1\src\backend
```

- **Chạy toàn bộ test suite:**
  ```bash
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

Sau khi chạy lệnh `--coverage`, Jest sẽ in ra một bảng tổng hợp trên Terminal và đồng thời tạo ra một thư mục `coverage/` chứa trang HTML báo cáo chi tiết. Bạn có thể mở file `coverage/lcov-report/index.html` bằng trình duyệt để xem dòng code nào chưa được test.

---

## 2. Kiến Trúc Giả Lập (Mocking Strategy)

Vì tiêu chí của chúng ta là **không đụng vào Database thật**, môi trường test sử dụng 3 kỹ thuật giả lập chính:

### a) Mock Request & Response của Express
Sử dụng thư viện `node-mocks-http` để không cần phải chạy một server HTTP thực thụ (không cần khởi tạo App Express listening ở port nào cả).
```typescript
import { createRequest, createResponse } from 'node-mocks-http';

const req = createRequest({ body: { text: '29A12345', type: 'plate' } });
const res = createResponse();
await scanPost(req, res);
```

### b) Mock Mongoose Models (Database)
Thay vì kết nối MongoDB, chúng ta giả lập các hàm `findOne`, `findById`, `save` của Mongoose thông qua `jest.mock()`.
```typescript
jest.mock('../models/appointment.model');

// Ví dụ giả lập hành vi tìm kiếm trả về 1 Object
(Appointment.findOne as jest.Mock).mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue({ truckPlate: '29A12345' }) // Data trả về
});
```

### c) Mock Fake Timers (Kiểm soát Thời gian)
Hệ thống có logic validate khung giờ ±30 phút và timeout 60 giây. Nếu để thời gian thực, test sẽ lúc đúng lúc sai tùy thời điểm bạn chạy code. Do đó ta **đóng băng thời gian** bằng Fake Timers.
```typescript
beforeEach(() => {
  jest.useFakeTimers();
  // Khóa cứng thời gian hệ thống ở mốc 10:00:00 AM (múi giờ +07:00)
  jest.setSystemTime(new Date('2023-10-10T10:00:00+07:00'));
});

// Tua nhanh thời gian thêm 65 giây để test timeout
jest.advanceTimersByTime(65000); 
```

---

## 3. Hướng Dẫn Viết Thêm Test Case Mới

Khi bạn cần thêm test case hoặc viết test cho một Controller khác (VD: `appointment.controller.ts`), hãy làm theo các bước sau:

**Bước 1: Tạo file test**
Tạo file mới trong thư mục `tests` có đuôi `.test.ts`. VD: `tests/appointment.controller.test.ts`.

**Bước 2: Cấu trúc bộ khung cơ bản**
```typescript
import { Request, Response } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';
import { Appointment } from '../models/appointment.model';
// Import controller của bạn vào đây...

jest.mock('../models/appointment.model');

describe('Appointment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Đảm bảo trạng thái mock sạch sẽ cho mỗi test
  });

  it('Nên trả về 200 khi data hợp lệ', async () => {
    // 1. Arrange: Chuẩn bị input và Mock
    const req = createRequest({ /* params, body... */ });
    const res = createResponse();
    (Appointment.find as jest.Mock).mockResolvedValue([{ /* mock data */ }]);

    // 2. Act: Gọi hàm cần test
    await getAppointments(req, res);

    // 3. Assert: Kiểm tra kết quả
    expect(res._getJSONData().code).toBe('success');
  });
});
```

**Bước 3: Chú ý Cập Nhật Cấu hình Coverage (Tùy chọn)**
Mặc định, file `jest.config.js` của tôi cấu hình chỉ thu thập coverage của file `scan.controller.ts`. Nếu bạn muốn Jest tính coverage cho toàn bộ thư mục controllers, hãy sửa file `jest.config.js`:
```javascript
module.exports = {
  //...
  collectCoverageFrom: [
    'controllers/**/*.ts' // Thay vì khai báo file cụ thể
  ]
};
```

---

## 4. Một Số Lỗi Thường Gặp Khi Viết Test

1. **`TypeError: ... is not a function`**: Thường do bạn chưa mock phương thức đó. Ví dụ gọi `GateTransaction.countDocuments()` nhưng chưa mock.
   - **Khắc phục:** Khai báo mock ở trên đầu file hoặc trong `beforeEach`: `(GateTransaction.countDocuments as jest.Mock).mockResolvedValue(0);`
2. **Nhiễu dữ liệu (Test này chạy đúng, chạy cùng test khác lại sai)**:
   - Thường do biến cache cục bộ trong file Controller.
   - **Khắc phục:** Đối với cache dùng ID/IP làm khóa (như `cameraScanCache`), hãy luôn truyền cho mỗi test case một ID/IP độc nhất (`ip1`, `ip2`...). Đừng dùng chung một IP cho tất cả các bài test.
3. **Promise / Timeout treo mãi mãi**:
   - Nếu Controller của bạn có dùng `setTimeout` thì cần cực kỳ cẩn thận với `jest.useFakeTimers()`. Đảm bảo gọi `jest.advanceTimersByTime()` đủ để vượt qua timeout đó. 
