import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AccountAdmin } from "../models/account-admin.model";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";
import { sendMail } from "../helpers/mail.helper";
import { CompanyRole } from "../models/companyRole.model";

export const registerPost = async (req: Request, res: Response) => {
  try {
    const { fullName, email, role, password } = req.body;

    // 1. Check if email already exists
    const existingUser = await AccountAdmin.findOne({ email });
    if (existingUser) {
      return res.json({
        code: "error",
        message: "Email đã được sử dụng. Vui lòng chọn email khác.",
      });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and save new account
    const newAccount = new AccountAdmin({
      fullName,
      email,
      role,
      password: hashedPassword,
    });

    await newAccount.save();

    // 4. Respond success
    return res.json({
      code: "success",
      message: "Đăng ký tài khoản thành công!",
      data: {
        id: newAccount._id,
        fullName: newAccount.fullName,
        email: newAccount.email,
        role: newAccount.role,
      },
    });
  } catch (error: any) {
    console.error("Register Error: ", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình đăng ký.",
    });
  }
};

export const loginPost = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existAccount = await AccountAdmin.findOne({ email });
    if (!existAccount) {
      return res.json({
        code: "error",
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    const isHashedPassword = await bcrypt.compare(
      password,
      existAccount.password,
    );
    if (!isHashedPassword) {
      return res.json({
        code: "error",
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    if (!existAccount.isActive) {
      return res.json({
        code: "error",
        message: "Tài khoản của bạn không được kích hoạt",
      });
    }

    const tokenVersion = Date.now().toString();

    const tokenAdmin = jwt.sign(
      {
        id: existAccount._id,
        role: existAccount.role,
        email: existAccount.email,
        tokenVersion: tokenVersion,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      },
    );

    await redisClient.setEx(
      `auth:session:${existAccount._id}`,
      86400,
      tokenVersion,
    );

    res.cookie("tokenAdmin", tokenAdmin, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax", //cho phep gui cookie linh hoat giua cac website
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
            ? process.env.COOKIE_DOMAIN.replace(/['"]/g, "").trim()
            : undefined
          : "localhost", // Thêm dấu chấm này để Token có hiệu lực ở mọi nơi
      path: "/",
      secure: process.env.NODE_ENV === "production", // https: true, http: false
    });

    return res.json({
      code: "success",
      message: "Đăng nhập thành công!",
    });
  } catch (error: any) {
    console.error("Login Error: ", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.tokenAdmin;

    if (token) {
      // Giải mã để lấy ID
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // Xóa Session trên Redis
      await redisClient.del(`auth:session:${decoded.id}`);
    }
    res.clearCookie("tokenAdmin", {
      httpOnly: true,
      sameSite: "lax", //cho phep gui cookie linh hoat giua cac website
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
            ? process.env.COOKIE_DOMAIN.replace(/['"]/g, "").trim()
            : undefined
          : "localhost", // Thêm dấu chấm này để Token có hiệu lực ở mọi nơi
      path: "/",
      secure: process.env.NODE_ENV === "production", // https: true, http: false
    });
    return res.json({
      code: "success",
      message: "Đăng xuất thành công!",
    });
  } catch (error: any) {
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình đăng xuất.",
    });
  }
};

export const forgotPasswordPost = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const existAccount = await AccountAdmin.findOne({
      email: email,
      isActive: true,
    });
    if (!existAccount) {
      return res.json({
        code: "error",
        message: "Không tồn tại tài khoản với email này",
      });
    }

    // 1. Tạo mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Lưu OTP vào Redis với thời hạn 3 phút (180 giây)
    //Check xem trong redis đã tồn tại mã otp của email này hay chưa
    const existOtp = await redisClient.get(`auth:otp:${email}`);
    if (existOtp) {
      return res.json({
        code: "error",
        message: "Bạn đã yêu cầu mã OTP trong vòng 3 phút vừa qua",
      });
    }
    // Cấu trúc key: auth:otp:email -> Hash:otp
    await redisClient.setEx(`auth:otp:${email}`, 180, otp);

    // 3. Chuẩn bị nội dung và gửi email
    const subject = "Mã xác nhận khôi phục mật khẩu - LogiPort System";
    const htmlContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 40px 20px; color: #121212;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border-top: 4px solid #1ed760;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #121212;">
            Logi<span style="color: #1ed760;">Port</span>
          </h1>
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Khôi phục mật khẩu!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #666666; margin-bottom: 24px;">
            Xin chào <b style="color: #121212;">\${existAccount.fullName}</b>,<br/><br/>
            Hệ thống nhận được yêu cầu khôi phục mật khẩu cho tài khoản công vụ của bạn trên <strong>LogiPort</strong>.
          </p>
          
          <div style="background-color: #e8fbf0; border-left: 4px solid #1ed760; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0; text-align: center;">
            <p style="margin: 0; font-size: 15px; color: #1db954; font-weight: 700;">
              Mã xác nhận (OTP) của bạn là:
            </p>
            <h2 style="margin: 8px 0 0 0; font-size: 32px; color: #121212; letter-spacing: 5px;">\${otp}</h2>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #666666; margin-bottom: 32px;">
            <span style="color: #f3727f; font-weight: bold;">Lưu ý:</span> Mã OTP này chỉ có hiệu lực trong vòng <strong>3 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và bảo mật tài khoản của mình.
          </p>

          <div style="border-top: 1px solid #e5e5e5; padding-top: 24px;">
            <p style="margin: 0; font-size: 14px; color: #999999; font-weight: 700;">Trân trọng,</p>
            <p style="margin: 4px 0 0 0; font-size: 16px; color: #121212; font-weight: 900;">Đội ngũ LogiPort</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <p style="font-size: 12px; color: #999999; line-height: 1.5;">
            Đây là email tự động từ hệ thống LogiPort. Vui lòng không trả lời email này.<br/>
            © \${new Date().getFullYear()} LogiPort. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Gọi hàm sendMail (không cần await nếu không muốn block request quá lâu)
    sendMail(email, subject, htmlContent);

    // 4. Trả về kết quả thành công cho Frontend
    return res.json({
      code: "success",
      message: "Đã gửi mã khôi phục qua email. Vui lòng kiểm tra hộp thư.",
    });
  } catch (error) {
    console.error("Forgot Password Error: ", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình gửi yêu cầu khôi phục.",
    });
  }
};

export const resetPasswordPost = async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = req.body;

    const existingUser = await AccountAdmin.findOne({ email });
    if (!existingUser) {
      return res.json({
        code: "error",
        message: "Email không tồn tại",
      });
    }

    const storedOtp = await redisClient.get(`auth:otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.json({
        code: "error",
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await AccountAdmin.updateOne({ email }, { password: hashedPassword });

    await redisClient.del(`auth:otp:${email}`);

    return res.json({
      code: "success",
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Reset Password Error: ", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình đặt lại mật khẩu.",
    });
  }
};

export const getClientRoles = async (req: Request, res: Response) => {
  try {
    const roles = await CompanyRole.find({
      status: "Active",
      isDeleted: false,
    }).select("roleCode roleName");

    return res.json({
      code: "success",
      data: roles,
    });
  } catch (error) {
    return res.json({
      code: "error",
      message: "Không thể tải danh sách loại hình doanh nghiệp",
    });
  }
};
