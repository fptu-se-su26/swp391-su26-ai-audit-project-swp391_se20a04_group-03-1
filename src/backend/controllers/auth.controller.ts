import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AccountAdmin } from "../models/account-admin.model";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";

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
