import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AccountAdmin } from "../models/account-admin.model";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";
import { sendMail } from "../helpers/mail.helper";

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
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
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
    res.clearCookie("tokenAdmin");
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
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h3>Xin chào ${existAccount.fullName},</h3>
        <p>Hệ thống nhận được yêu cầu khôi phục mật khẩu cho tài khoản công vụ của bạn.</p>
        <p>Mã xác nhận (OTP) của bạn là:</p>
        <h2 style="color: #00D4FF; background-color: #1c2541; padding: 10px 20px; display: inline-block; border-radius: 5px;">${otp}</h2>
        <p style="color: red;"><strong>Lưu ý:</strong> Mã này chỉ có hiệu lực trong vòng <strong>3 phút</strong>.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và bảo mật tài khoản của mình.</p>
        <hr />
        <p>Trân trọng,<br />LogiPort System</p>
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
