import PDFDocument from "pdfkit";
import path from "path";

/**
 * Sinh phiếu xác nhận xe vào bãi (check-in) dạng PDF.
 *
 * Dùng font DejaVuSans (hỗ trợ đầy đủ tiếng Việt có dấu) nhúng trong
 * assets/fonts — font mặc định của pdfkit (Helvetica) KHÔNG render được dấu.
 */

export interface CheckInTicketData {
  ticketCode: string;
  truckPlate: string;
  containerNo: string;
  driverName: string;
  driverPhone: string;
  purpose: string;
  scheduledDate?: Date;
  timeSlot: string;
  checkInTime?: Date;
  yardName?: string;
  slotName?: string;
}

const FONT_DIR = path.join(__dirname, "..", "assets", "fonts");
const FONT_REGULAR = path.join(FONT_DIR, "DejaVuSans.ttf");
const FONT_BOLD = path.join(FONT_DIR, "DejaVuSans-Bold.ttf");

const GREEN = "#1ed760";
const DARK = "#121212";
const GRAY = "#666666";

const fmtDateTime = (d?: Date) =>
  d
    ? new Date(d).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const fmtDate = (d?: Date) =>
  d
    ? new Date(d).toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

/**
 * Dựng document PDF phiếu check-in.
 * Caller chịu trách nhiệm `doc.pipe(res)` rồi `doc.end()`.
 */
export function buildCheckInTicketPdf(data: CheckInTicketData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A5", margin: 36 });

  doc.registerFont("body", FONT_REGULAR);
  doc.registerFont("bold", FONT_BOLD);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentW = right - left;

  // ---- Header thương hiệu ----
  doc
    .font("bold")
    .fontSize(22)
    .fillColor(DARK)
    .text("LOGIPORT", left, doc.y, { continued: false });
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text("CẢNG CONTAINER THÔNG MINH");

  doc.moveDown(0.6);
  doc
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(2)
    .strokeColor(GREEN)
    .stroke();
  doc.moveDown(0.8);

  // ---- Tiêu đề phiếu ----
  doc
    .font("bold")
    .fontSize(15)
    .fillColor(DARK)
    .text("PHIẾU XÁC NHẬN XE VÀO BÃI", { align: "center" });
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text(`Mã phiếu: ${data.ticketCode}`, { align: "center" });
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text(`Thời gian vào bãi: ${fmtDateTime(data.checkInTime)}`, { align: "center" });

  doc.moveDown(1);

  // ---- Ô đỗ được cấp (nhấn mạnh) ----
  const boxTop = doc.y;
  const boxH = 58;
  doc
    .roundedRect(left, boxTop, contentW, boxH, 8)
    .lineWidth(1.5)
    .strokeColor(GREEN)
    .stroke();
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text("VỊ TRÍ ĐỖ ĐƯỢC CẤP", left, boxTop + 10, {
      width: contentW,
      align: "center",
    });
  const slotLabel =
    data.slotName && data.yardName
      ? `${data.yardName}  •  Ô ${data.slotName}`
      : data.slotName
        ? `Ô ${data.slotName}`
        : "Chưa gán ô đỗ";
  doc
    .font("bold")
    .fontSize(18)
    .fillColor(DARK)
    .text(slotLabel, left, boxTop + 26, { width: contentW, align: "center" });

  doc.y = boxTop + boxH + 18;

  // ---- Bảng thông tin ----
  const rows: [string, string][] = [
    ["Biển số xe", data.truckPlate || "—"],
    ["Số container", data.containerNo || "—"],
    ["Tài xế", data.driverName || "—"],
    ["Số điện thoại", data.driverPhone || "—"],
    ["Mục đích", data.purpose || "—"],
    ["Ngày hẹn", fmtDate(data.scheduledDate)],
    ["Khung giờ", data.timeSlot || "—"],
  ];

  const labelW = 130;
  const rowH = 24;
  for (const [label, value] of rows) {
    const y = doc.y;
    doc
      .font("body")
      .fontSize(10)
      .fillColor(GRAY)
      .text(label, left, y + 6, { width: labelW });
    doc
      .font("bold")
      .fontSize(11)
      .fillColor(DARK)
      .text(value, left + labelW, y + 6, { width: contentW - labelW });
    doc
      .moveTo(left, y + rowH)
      .lineTo(right, y + rowH)
      .lineWidth(0.5)
      .strokeColor("#e5e5e5")
      .stroke();
    doc.y = y + rowH;
  }

  // ---- Footer ----
  doc.moveDown(1.5);
  doc
    .font("body")
    .fontSize(8)
    .fillColor(GRAY)
    .text(
      "Phiếu được sinh tự động bởi hệ thống LogiPort. Vui lòng xuất trình khi ra khỏi bãi.",
      { align: "center" },
    );

  return doc;
}

/**
 * Dữ liệu phiếu hoàn thành giao nhận (gửi cho doanh nghiệp qua email khi lịch
 * hẹn chuyển sang trạng thái Completed — tức xe đã check-out khỏi cảng).
 */
export interface CompletionReceiptData {
  receiptCode: string;
  companyName?: string;
  truckPlate: string;
  containerNo: string;
  driverName: string;
  driverPhone: string;
  purpose: string;
  scheduledDate?: Date;
  timeSlot: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  yardName?: string;
  slotName?: string;
  // Cách hoàn thành: qua camera AI, quét QR ở app, hay check-out thủ công.
  method?: string;
}

/** Khoảng thời gian lưu bãi dạng "2 giờ 15 phút" từ 2 mốc check-in/out. */
const fmtDuration = (start?: Date, end?: Date): string => {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
};

/**
 * Dựng PDF phiếu hoàn thành giao nhận. Caller pipe/end hoặc dùng
 * pdfToBuffer để đính kèm email.
 */
export function buildCompletionReceiptPdf(
  data: CompletionReceiptData,
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A5", margin: 36 });

  doc.registerFont("body", FONT_REGULAR);
  doc.registerFont("bold", FONT_BOLD);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentW = right - left;

  // ---- Header thương hiệu ----
  doc.font("bold").fontSize(22).fillColor(DARK).text("LOGIPORT", left, doc.y);
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text("CẢNG CONTAINER THÔNG MINH");

  doc.moveDown(0.6);
  doc
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(2)
    .strokeColor(GREEN)
    .stroke();
  doc.moveDown(0.8);

  // ---- Tiêu đề phiếu ----
  doc
    .font("bold")
    .fontSize(15)
    .fillColor(DARK)
    .text("PHIẾU HOÀN THÀNH GIAO NHẬN", { align: "center" });
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text(`Mã phiếu: ${data.receiptCode}`, { align: "center" });
  if (data.companyName) {
    doc
      .font("body")
      .fontSize(9)
      .fillColor(GRAY)
      .text(`Doanh nghiệp: ${data.companyName}`, { align: "center" });
  }

  doc.moveDown(1);

  // ---- Ô nhấn mạnh: thời gian lưu bãi ----
  const boxTop = doc.y;
  const boxH = 58;
  doc
    .roundedRect(left, boxTop, contentW, boxH, 8)
    .lineWidth(1.5)
    .strokeColor(GREEN)
    .stroke();
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text("TỔNG THỜI GIAN LƯU BÃI", left, boxTop + 10, {
      width: contentW,
      align: "center",
    });
  doc
    .font("bold")
    .fontSize(18)
    .fillColor(DARK)
    .text(fmtDuration(data.checkInTime, data.checkOutTime), left, boxTop + 26, {
      width: contentW,
      align: "center",
    });

  doc.y = boxTop + boxH + 18;

  // ---- Bảng thông tin ----
  const slotLabel =
    data.slotName && data.yardName
      ? `${data.yardName} • Ô ${data.slotName}`
      : data.slotName || "—";
  const rows: [string, string][] = [
    ["Biển số xe", data.truckPlate || "—"],
    ["Số container", data.containerNo || "—"],
    ["Tài xế", data.driverName || "—"],
    ["Số điện thoại", data.driverPhone || "—"],
    ["Mục đích", data.purpose || "—"],
    ["Ngày hẹn", fmtDate(data.scheduledDate)],
    ["Khung giờ", data.timeSlot || "—"],
    ["Vị trí đỗ", slotLabel],
    ["Giờ vào cảng", fmtDateTime(data.checkInTime)],
    ["Giờ rời cảng", fmtDateTime(data.checkOutTime)],
    ["Hình thức", data.method || "Camera AI"],
  ];

  const labelW = 130;
  const rowH = 22;
  for (const [label, value] of rows) {
    const y = doc.y;
    doc
      .font("body")
      .fontSize(10)
      .fillColor(GRAY)
      .text(label, left, y + 6, { width: labelW });
    doc
      .font("bold")
      .fontSize(11)
      .fillColor(DARK)
      .text(value, left + labelW, y + 6, { width: contentW - labelW });
    doc
      .moveTo(left, y + rowH)
      .lineTo(right, y + rowH)
      .lineWidth(0.5)
      .strokeColor("#e5e5e5")
      .stroke();
    doc.y = y + rowH;
  }

  // ---- Footer ----
  doc.moveDown(1.2);
  doc
    .font("body")
    .fontSize(8)
    .fillColor(GRAY)
    .text(
      "Phiếu được sinh tự động bởi hệ thống LogiPort khi lịch hẹn hoàn thành. " +
        "Vui lòng lưu lại để đối chiếu.",
      { align: "center" },
    );

  return doc;
}

/**
 * Gom một PDFKit document thành Buffer (để đính kèm email). Tự gọi doc.end().
 */
export function pdfToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}
