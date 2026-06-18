import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ContainerProvider } from "../../models/container-provider.model";
import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis.config";
import { sendMail } from "../../helpers/mail.helper";

export const registerPost = async (req: Request, res: Response) => {
  try {
    const { code, name, contact_email, password, roleCode, bic_codes } = req.body;

    if (roleCode !== "provider") {
      return res.json({
        code: "error",
        message: "Quyền không hợp lệ",
      });
    }

    const existEmail = await ContainerProvider.findOne({ contact_email });
    if (existEmail) {
      return res.json({
        code: "error",
        message: "Email nhà cung cấp đã tồn tại",
      });
    }

    const existCode = await ContainerProvider.findOne({ code });
    if (existCode) {
      return res.json({
        code: "error",
        message: "Mã nhà cung cấp đã tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newProvider = new ContainerProvider({
      code,
      name,
      contact_email,
      password: hashedPassword,
      status: "INACTIVE",
      bic_codes: bic_codes ? bic_codes.split(",").map((c: string) => c.trim()).filter((c: string) => c) : [],
    });

    await newProvider.save();

    // Gửi email thông báo
    const mailTitle = "Đăng ký tài khoản LogiPort thành công";
    const mailContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 40px 20px; color: #121212;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border-top: 4px solid #1ed760;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #121212;">
            Logi<span style="color: #1ed760;">Port</span>
          </h1>
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Đăng ký tài khoản thành công!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #666666; margin-bottom: 24px;">
            Xin chào <b style="color: #121212;">${name}</b>,<br/><br/>
            Cảm ơn bạn đã tin tưởng và đăng ký tài khoản nhà cung cấp Container trên hệ thống điều phối logistics thông minh <strong>LogiPort</strong>.
          </p>
          
          <div style="background-color: #e8fbf0; border-left: 4px solid #1ed760; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; font-size: 15px; color: #1db954; font-weight: 700;">
              Tài khoản của bạn hiện đang ở trạng thái Chờ duyệt (Inactive).
            </p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
              Ban quản trị sẽ tiến hành xác thực thông tin và kích hoạt tài khoản của bạn trong thời gian sớm nhất.
            </p>
          </div>

          <div style="background-color: #f8f8f8; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #121212;">Thông tin đăng ký</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666; width: 40%;">Mã nhà cung cấp</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${code}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666;">Tên nhà cung cấp</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666666;">Email liên hệ</td>
                <td style="padding: 8px 0; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${contact_email}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #666666; margin-bottom: 32px;">
            Vui lòng theo dõi hộp thư, chúng tôi sẽ gửi email thông báo tiếp theo ngay khi tài khoản được kích hoạt thành công.
          </p>

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
    `;
    sendMail(contact_email, mailTitle, mailContent);

    return res.json({
      code: "success",
      message: "Đăng ký thành công! Vui lòng chờ quản trị viên duyệt.",
    });
  } catch (error) {
    console.error(error);
    return res.json({
      code: "error",
      message: "Lỗi hệ thống",
    });
  }
};

export const loginPost = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const provider = await ContainerProvider.findOne({ contact_email: email, isDeleted: false });
    if (!provider) {
      return res.json({
        code: "error",
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.json({
        code: "error",
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    if (provider.status === "INACTIVE") {
      return res.json({
        code: "error",
        message: "Tài khoản của bạn chưa được kích hoạt",
      });
    }

    if (provider.status === "SUSPENDED") {
      return res.json({
        code: "error",
        message: "Tài khoản của bạn đã bị khóa",
      });
    }

    const tokenVersion = Date.now().toString();

    const tokenProvider = jwt.sign(
      {
        id: provider._id,
        role: "provider",
        email: provider.contact_email,
        tokenVersion: tokenVersion,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    await redisClient.setEx(
      `auth:provider:session:${provider._id}`,
      86400,
      tokenVersion
    );

    res.cookie("tokenProvider", tokenProvider, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
            ? process.env.COOKIE_DOMAIN.replace(/['"]/g, "").trim()
            : undefined
          : "localhost",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      code: "success",
      message: "Đăng nhập thành công!",
    });
  } catch (error) {
    console.error(error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.tokenProvider;

    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      await redisClient.del(`auth:provider:session:${decoded.id}`);
    }

    res.clearCookie("tokenProvider", {
      httpOnly: true,
      sameSite: "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
            ? process.env.COOKIE_DOMAIN.replace(/['"]/g, "").trim()
            : undefined
          : "localhost",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    
    return res.json({
      code: "success",
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    return res.json({
      code: "error",
      message: "Lỗi hệ thống",
    });
  }
};

export const forgotPasswordPost = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const provider = await ContainerProvider.findOne({ contact_email: email, isDeleted: false });
    
    if (!provider) {
      return res.json({
        code: "error",
        message: "Email không tồn tại trong hệ thống!",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = 300; 
    
    await redisClient.setEx(`otp:provider:${email}`, expireTime, otp);

    const subject = "Mã OTP Khôi Phục Mật Khẩu Nhà Cung Cấp";
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 40px 20px; color: #121212;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border-top: 4px solid #1ed760;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #121212;">
            Logi<span style="color: #1ed760;">Port</span>
          </h1>
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Khôi phục mật khẩu!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #666666; margin-bottom: 24px;">
            Xin chào <b style="color: #121212;">\${provider.name}</b>,<br/><br/>
            Hệ thống nhận được yêu cầu khôi phục mật khẩu cho tài khoản nhà cung cấp của bạn trên <strong>LogiPort</strong>.
          </p>
          
          <div style="background-color: #e8fbf0; border-left: 4px solid #1ed760; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0; text-align: center;">
            <p style="margin: 0; font-size: 15px; color: #1db954; font-weight: 700;">
              Mã xác nhận (OTP) của bạn là:
            </p>
            <h2 style="margin: 8px 0 0 0; font-size: 32px; color: #121212; letter-spacing: 5px;">\${otp}</h2>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #666666; margin-bottom: 32px;">
            <span style="color: #f3727f; font-weight: bold;">Lưu ý:</span> Mã OTP này chỉ có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và bảo mật tài khoản của mình.
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

    await sendMail(email, subject, html);

    res.json({
      code: "success",
      message: "Mã OTP đã được gửi đến email của bạn",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Không thể gửi email lúc này",
    });
  }
};

export const otpPasswordPost = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    const storedOtp = await redisClient.get(`otp:provider:${email}`);
    
    if (!storedOtp) {
      return res.json({
        code: "error",
        message: "Mã OTP đã hết hạn hoặc không tồn tại!",
      });
    }

    if (storedOtp !== otp) {
      return res.json({
        code: "error",
        message: "Mã OTP không chính xác!",
      });
    }

    await redisClient.del(`otp:provider:${email}`);
    await redisClient.setEx(`reset:provider:${email}`, 900, "verified");

    res.json({
      code: "success",
      message: "Xác thực OTP thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Lỗi xác thực",
    });
  }
};

export const resetPasswordPost = async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = req.body;
    
    const provider = await ContainerProvider.findOne({ contact_email: email, isDeleted: false });
    if (!provider) {
      return res.json({
        code: "error",
        message: "Email không tồn tại trong hệ thống!",
      });
    }

    const storedOtp = await redisClient.get(`otp:provider:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.json({
        code: "error",
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    provider.password = hashedPassword;
    await provider.save();

    await redisClient.del(`otp:provider:${email}`);

    res.json({
      code: "success",
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Lỗi cập nhật mật khẩu",
    });
  }
};
