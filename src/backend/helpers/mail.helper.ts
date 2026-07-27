// Import the Nodemailer library
import nodemailer from "nodemailer";

// Một transporter dùng chung cho mọi email — tránh tạo lại kết nối SMTP mỗi lần.
const buildTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use false for STARTTLS; true for SSL on port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP,
    },
  });

export const sendMail = (email: string, title: string, content: string) => {
  const transporter = buildTransporter();

  // Configure the mailoptions object
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: title,
    html: content,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

/**
 * Gửi email kèm tệp đính kèm (vd phiếu PDF). Trả về Promise để caller await
 * và bắt lỗi. Dùng cho phiếu hoàn thành giao nhận gửi doanh nghiệp.
 */
export const sendMailWithAttachments = async (
  email: string,
  title: string,
  content: string,
  attachments: MailAttachment[],
): Promise<void> => {
  const transporter = buildTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: title,
    html: content,
    attachments,
  });
};

/**
 * Thân email phiếu hoàn thành giao nhận — báo doanh nghiệp lịch hẹn đã hoàn tất
 * (xe đã rời cảng), phiếu chi tiết đính kèm PDF.
 */
export const buildCompletionReceiptEmail = (params: {
  companyName?: string;
  truckPlate: string;
  containerNo: string;
  purpose: string;
  timeSlot: string;
  checkOutTimeText: string;
  receiptCode: string;
}): string => {
  const {
    companyName,
    truckPlate,
    containerNo,
    purpose,
    timeSlot,
    checkOutTimeText,
    receiptCode,
  } = params;

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff;">
      <div style="background-color: #121212; border-radius: 12px; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 900; color: #1ed760; letter-spacing: -0.5px;">LogiPort</span>
        </div>
        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px;">
          <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 900; color: #121212;">Lịch hẹn đã hoàn thành</h2>
          <p style="margin: 0 0 24px 0; font-size: 15px; color: #666666; line-height: 1.6;">
            ${companyName ? `Kính gửi <strong>${companyName}</strong>,<br/>` : ""}
            Chuyến giao nhận container của quý doanh nghiệp đã hoàn tất. Phiếu hoàn thành chi tiết được đính kèm dưới dạng PDF.
          </p>

          <div style="background-color: #eafaf0; border-left: 4px solid #1ed760; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; font-size: 15px; color: #0f7a37; font-weight: 700;">
              Xe ${truckPlate} đã rời cảng lúc ${checkOutTimeText}
            </p>
          </div>

          <div style="background-color: #f8f8f8; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #121212;">Thông tin chuyến</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666; width: 45%;">Mã phiếu</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${receiptCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666;">Biển số xe</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${truckPlate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666;">Số container</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${containerNo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666;">Mục đích</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${purpose}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666666;">Khung giờ</td>
                <td style="padding: 8px 0; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${timeSlot}</td>
              </tr>
            </table>
          </div>

          <div style="border-top: 1px solid #e5e5e5; padding-top: 24px;">
            <p style="margin: 0; font-size: 14px; color: #999999; font-weight: 700;">Trân trọng,</p>
            <p style="margin: 4px 0 0 0; font-size: 16px; color: #121212; font-weight: 900;">Đội ngũ LogiPort</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <p style="font-size: 12px; color: #999999; line-height: 1.5;">
            Đây là email tự động từ hệ thống LogiPort. Vui lòng không trả lời email này.<br/>
            © ${new Date().getFullYear()} LogiPort. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
};

// Email khởi tạo tài khoản (admin cấp cho doanh nghiệp / nhà cung cấp).
// QUAN TRỌNG: KHÔNG bao giờ gửi mật khẩu trong email. Người dùng đăng nhập
// bằng mật khẩu đã được cấp riêng, hoặc dùng chức năng "Quên mật khẩu".
export const buildAccountProvisionEmail = (params: {
  name: string;
  codeLabel: string;
  code: string;
  email: string;
  isActive: boolean;
  // loginUrl: nút "Đăng nhập ngay" (tài khoản có cổng web). Bỏ trống với tài
  // khoản đăng nhập bằng app mobile (tài xế) và truyền appNote thay thế.
  loginUrl?: string;
  appNote?: string;
}): string => {
  const { name, codeLabel, code, email, isActive, loginUrl, appNote } = params;

  const statusColor = isActive ? "#1ed760" : "#f0a500";
  const statusBg = isActive ? "#eafaf0" : "#fdf6e3";
  const statusText = isActive ? "Đã kích hoạt" : "Chờ kích hoạt";
  const statusMessage = isActive
    ? "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ."
    : "Tài khoản của bạn đã được khởi tạo và đang chờ quản trị viên kích hoạt. Bạn sẽ nhận được thông báo khi có thể đăng nhập.";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff;">
      <div style="background-color: #121212; border-radius: 12px; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 900; color: #1ed760; letter-spacing: -0.5px;">LogiPort</span>
        </div>
        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px;">
          <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 900; color: #121212;">Chào ${name},</h2>
          <p style="margin: 0 0 24px 0; font-size: 15px; color: #666666; line-height: 1.6;">
            Quản trị viên LogiPort đã khởi tạo một tài khoản cho bạn. Dưới đây là thông tin đăng nhập của bạn.
          </p>

          <div style="background-color: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; font-size: 15px; color: ${statusColor}; font-weight: 700;">
              Trạng thái tài khoản: ${statusText}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
              ${statusMessage}
            </p>
          </div>

          <div style="background-color: #f8f8f8; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #121212;">Thông tin tài khoản</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666; width: 40%;">${codeLabel}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${code}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666666;">Email đăng nhập</td>
                <td style="padding: 8px 0; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${email}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fdf6e3; border: 1px solid #f0e0b0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #8a6d00; line-height: 1.6;">
              🔒 Vì lý do bảo mật, mật khẩu <strong>không</strong> được gửi qua email. Vui lòng dùng mật khẩu đã được cấp riêng cho bạn. Nếu bạn chưa có hoặc quên mật khẩu, hãy dùng chức năng <strong>"Quên mật khẩu"</strong> tại trang đăng nhập.
            </p>
          </div>

          ${
            appNote
              ? `<div style="background-color: #eafaf0; border: 1px solid #b8ebc9; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                   <p style="margin: 0; font-size: 14px; color: #0f7a37; line-height: 1.6;">📱 ${appNote}</p>
                 </div>`
              : ""
          }

          ${
            isActive && loginUrl
              ? `<a href="${loginUrl}" style="display: inline-block; background-color: #1ed760; color: #121212; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 500px; text-transform: uppercase; letter-spacing: 1.5px; font-size: 14px; margin-bottom: 32px;">Đăng nhập ngay</a>`
              : ""
          }

          <div style="border-top: 1px solid #e5e5e5; padding-top: 24px;">
            <p style="margin: 0; font-size: 14px; color: #999999; font-weight: 700;">Trân trọng,</p>
            <p style="margin: 4px 0 0 0; font-size: 16px; color: #121212; font-weight: 900;">Đội ngũ LogiPort</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <p style="font-size: 12px; color: #999999; line-height: 1.5;">
            Đây là email tự động từ hệ thống LogiPort. Vui lòng không trả lời email này.<br/>
            © ${new Date().getFullYear()} LogiPort. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
};
