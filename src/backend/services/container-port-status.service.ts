import { Container } from "../models/container.model";
import { notify } from "./notification.service";

/**
 * Cập nhật trạng thái cảng của container theo lượt xe qua cổng, và báo cho hãng
 * tàu sở hữu. Tách ra service dùng chung cho cả camera (scan.controller) lẫn
 * quét QR ở app quản lý cổng (gate-passage.service).
 */

// Trạng thái cảng kế tiếp của container, suy ra từ mục đích lịch hẹn và chiều qua cổng:
//   Trả container — xe chở container vào rồi hạ xuống bãi, ra tay không.
//   Lấy container — xe vào tay không, móc container ở bãi rồi chở ra.
// Trả về null nghĩa là lượt qua cổng này không làm đổi trạng thái container.
export const nextPortStatus = (
  purpose: string | undefined,
  direction: "in" | "out",
): string | null => {
  if (purpose === "Trả container") {
    return direction === "in" ? "Đã nhập cảng" : "Đang lưu bãi";
  }
  if (purpose === "Lấy container" && direction === "out") {
    return "Đã xuất cảng";
  }
  return null;
};

// Câu mô tả sự kiện cho hãng tàu, theo trạng thái cảng mới của container.
const PORT_STATUS_NOTE: Record<string, string> = {
  "Đã nhập cảng": "vừa được đưa vào cảng",
  "Đang lưu bãi": "đã hạ xuống bãi và đang lưu tại cảng",
  "Đã xuất cảng": "đã rời khỏi cảng",
};

const notifyProviderPortStatus = async (
  containerNo: string,
  portStatus: string,
): Promise<void> => {
  const note = PORT_STATUS_NOTE[portStatus];
  if (!note) return;

  const container = await Container.findOne({ number: containerNo })
    .select("providerId")
    .lean();
  // Container không gắn hãng tàu thì không có ai để báo — bỏ qua trong im lặng.
  if (!container?.providerId) return;

  await notify({
    audience: "provider",
    recipientId: container.providerId,
    type: "container",
    severity: portStatus === "Đã xuất cảng" ? "info" : "success",
    title: `Container ${containerNo} ${note}`,
    message: `Trạng thái cảng mới: ${portStatus}.`,
    link: "/client/provider/history",
    dedupeKey: `provider-port:${containerNo}:${portStatus}`,
  });
};

// Container nối với lịch hẹn qua mã (chuỗi), không phải khóa ngoại — nên khớp theo number.
// Không chặn luồng cổng nếu cập nhật lỗi: xe đã qua rồi, chỉ ghi log để soát lại.
export const syncContainerPortStatus = async (
  containerNo: string | undefined,
  purpose: string | undefined,
  direction: "in" | "out",
) => {
  const portStatus = nextPortStatus(purpose, direction);
  if (!portStatus || !containerNo) return;

  try {
    const result = await Container.updateOne(
      { number: containerNo.toUpperCase(), isDeleted: false },
      { portStatus },
      { runValidators: true },
    );
    if (result.matchedCount === 0) {
      console.warn(
        `[Container] Không tìm thấy container ${containerNo} để cập nhật "${portStatus}"`,
      );
      return;
    }

    // Báo cho hãng tàu sở hữu container biết container của họ vừa đổi trạng thái.
    // Tra lại bằng một truy vấn riêng thay vì đổi updateOne thành findOneAndUpdate:
    // giữ nguyên lệnh ghi vốn đã chạy ổn, và đây là đường đi ngoài luồng cổng.
    void notifyProviderPortStatus(containerNo.toUpperCase(), portStatus).catch(
      (err) => console.error("[Notification] Báo hãng tàu thất bại:", err),
    );
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái cảng của container:", err);
  }
};
