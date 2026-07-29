import { Actor, ActorKind } from "./audit-context";
import { AccountAdmin } from "../models/account-admin.model";
import { Company } from "../models/company.model";
import { ContainerProvider } from "../models/container-provider.model";
import { Driver } from "../models/driver.model";

/**
 * Tra tên hiển thị của người đang thao tác, để đóng dấu vào nhật ký sửa đổi.
 *
 * Token chỉ chứa id + email (xem auth.controller), KHÔNG có tên — nên phải tra
 * một lần từ DB. Chi phí này chỉ phát sinh ở request GHI (middleware bỏ qua GET),
 * nên không ảnh hưởng đường đọc vốn chiếm đa số.
 *
 * Tra hụt (tài khoản vừa bị xoá) vẫn trả về actor với email làm nhãn thay thế —
 * thà ghi nhận thiếu tên còn hơn mất dấu vết ai đã thao tác.
 */

const SYSTEM_ACTOR: Actor = {
  kind: "system",
  id: null,
  name: "Hệ thống",
};

/** Actor cho request nội bộ từ CV server (x-internal-secret). */
export const systemActor = (): Actor => ({ ...SYSTEM_ACTOR });

export const resolveActor = async (
  kind: ActorKind,
  decoded: any,
): Promise<Actor> => {
  const id = decoded?.id ? String(decoded.id) : null;
  const email: string | undefined = decoded?.email;
  const fallback = email || "Không rõ";

  if (!id) return { kind, id: null, name: fallback, email };

  try {
    switch (kind) {
      case "admin": {
        const doc = await AccountAdmin.findById(id).select("fullName email").lean();
        return {
          kind,
          id,
          name: doc?.fullName || fallback,
          email: doc?.email || email,
        };
      }
      case "company": {
        const doc = await Company.findById(id).select("companyName email").lean();
        return {
          kind,
          id,
          name: doc?.companyName || fallback,
          email: doc?.email || email,
        };
      }
      case "provider": {
        const doc = await ContainerProvider.findById(id)
          .select("name contact_email")
          .lean();
        return {
          kind,
          id,
          name: doc?.name || fallback,
          email: doc?.contact_email || email,
        };
      }
      case "driver": {
        const doc = await Driver.findById(id).select("driverName email").lean();
        return {
          kind,
          id,
          name: doc?.driverName || fallback,
          email: doc?.email || email,
        };
      }
      default:
        return systemActor();
    }
  } catch {
    // DB trục trặc thì vẫn đóng dấu được bằng thông tin có sẵn trong token.
    return { kind, id, name: fallback, email };
  }
};
