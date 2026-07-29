import { Schema } from "mongoose";
import { getCurrentActor } from "../helpers/audit-context";

/**
 * Plugin đóng dấu "ai tạo / ai sửa" cho mọi thao tác ghi.
 *
 * Gắn plugin vào schema là xong — không phải sửa controller. Nguồn actor lấy từ
 * AsyncLocalStorage do middleware xác thực đặt (helpers/audit-context.ts).
 *
 * LƯU TÊN KÈM ID (chụp lại tại thời điểm thao tác) thay vì chỉ ref ObjectId, vì:
 *   1. Actor có thể là admin, doanh nghiệp, hãng tàu hoặc tài xế — bốn collection
 *      khác nhau. Ref đơn không populate nổi, muốn hiện tên phải join nhiều bảng.
 *   2. Nhật ký kiểm toán phải phản ánh ĐÚNG lúc đó: ai thao tác dưới tên gì.
 *      Người này đổi tên, hoặc bị xoá tài khoản, thì lịch sử vẫn đọc được.
 * Đổi lại tên hiển thị không tự đồng bộ khi đổi hồ sơ — đúng ý đồ của nhật ký.
 */

export const actorSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["admin", "company", "provider", "driver", "system"],
      required: true,
    },
    id: { type: Schema.Types.ObjectId, default: null },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false },
);

export function auditPlugin(schema: Schema) {
  schema.add({
    createdBy: { type: actorSchema, default: null },
    updatedBy: { type: actorSchema, default: null },
  });

  // ── Tạo mới / lưu document (new + .save(), Model.create()) ────────────────
  // Mongoose 9 bỏ kiểu callback next() — hook chỉ cần chạy đồng bộ / trả promise.
  (schema as any).pre("save", function (this: any) {
    const actor = getCurrentActor();
    if (!actor) return; // ngoài request (seed, script, test) -> để trống
    if (this.isNew && !this.get("createdBy")) {
      this.set("createdBy", actor);
    }
    // Đặt cả khi tạo mới: bảng luôn có "sửa lần cuối bởi", không bị trống lệch.
    this.set("updatedBy", actor);
  });

  // ── Cập nhật qua query (Model.updateOne / findOneAndUpdate / updateMany) ──
  // query:true để chắc chắn bắt Model.updateOne dạng QUERY middleware, không bị
  // hiểu nhầm sang document middleware trùng tên. Ép kiểu vì overload của
  // mongoose không mô tả được tổ hợp (mảng hook + tuỳ chọn query).
  (schema as any).pre(
    ["updateOne", "findOneAndUpdate", "updateMany"],
    { query: true, document: false },
    function (this: any) {
      const actor = getCurrentActor();
      if (!actor) return;

      const update = this.getUpdate() || {};

      // Nhiều controller gọi updateOne({_id}, req.body) với OBJECT PHẲNG. Mongo
      // cấm trộn field phẳng chung với toán tử ($set), nên phải gom field phẳng
      // vào $set trước — đúng như mongoose vẫn tự làm, nên không đổi ngữ nghĩa.
      const operators: Record<string, any> = {};
      const flat: Record<string, any> = {};
      for (const [key, value] of Object.entries(update)) {
        if (key.startsWith("$")) operators[key] = value;
        else flat[key] = value;
      }

      this.setUpdate({
        ...operators,
        $set: { ...(operators.$set || {}), ...flat, updatedBy: actor },
        // Upsert cũng là "tạo mới" -> ghi createdBy. Khác đường dẫn với $set nên
        // không xung đột; với update thường thì Mongo bỏ qua $setOnInsert.
        $setOnInsert: { ...(operators.$setOnInsert || {}), createdBy: actor },
      });
    },
  );
}
