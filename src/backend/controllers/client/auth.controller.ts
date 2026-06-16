import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Company } from "../../models/company.model";
import { CompanyRole } from "../../models/companyRole.model";
import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis.config";

export const registerPost = async (req: Request, res: Response) => {
  try {
    const { fullName, email, role, password } = req.body;

    const existEmail = await Company.findOne({ email });
    if (existEmail) {
      return res.json({
        code: "error",
        message: "Email doanh nghiệp đã tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const companyRole = await CompanyRole.findOne({ roleCode: role });
    if (!companyRole) {
      return res.json({
        code: "error",
        message: "Loại hình doanh nghiệp không hợp lệ",
      });
    }

    const count = await Company.countDocuments();
    const companyCode = `COMP${(count + 1).toString().padStart(4, "0")}`;

    const newCompany = new Company({
      companyCode,
      companyName: fullName,
      contactPerson: fullName,
      contactPhone: "Chưa cập nhật",
      email,
      password: hashedPassword,
      companyRole: companyRole._id,
      status: "Active",
    });

    await newCompany.save();

    return res.json({
      code: "success",
      message: "Đăng ký tài khoản doanh nghiệp thành công!",
    });
  } catch (error) {
    console.error("Client Register Error:", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi hệ thống trong quá trình đăng ký.",
    });
  }
};

export const loginPost = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existAccount = await Company.findOne({ email });
    if (!existAccount) {
      return res.json({
        code: "error",
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    if (existAccount.isDeleted) {
      return res.json({
        code: "error",
        message: "Tài khoản đã bị xóa",
      });
    }

    const isHashedPassword = await bcrypt.compare(password, existAccount.password);
    if (!isHashedPassword) {
      return res.json({
        code: "error",
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    if (existAccount.status !== "Active") {
      return res.json({
        code: "error",
        message: "Tài khoản của bạn không ở trạng thái hoạt động",
      });
    }

    const tokenVersion = Date.now().toString();

    const tokenCompany = jwt.sign(
      {
        id: existAccount._id,
        email: existAccount.email,
        companyRole: existAccount.companyRole,
        tokenVersion,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    await redisClient.setEx(`auth:company:session:${existAccount._id}`, 86400, tokenVersion);

    res.cookie("tokenCompany", tokenCompany, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN?.replace(/['"]/g, "").trim() : "localhost",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      code: "success",
      message: "Đăng nhập thành công!",
    });
  } catch (error) {
    console.error("Client Login Error:", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi hệ thống trong quá trình đăng nhập.",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.tokenCompany;

    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      await redisClient.del(`auth:company:session:${decoded.id}`);
    }
    res.clearCookie("tokenCompany", {
      httpOnly: true,
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN?.replace(/['"]/g, "").trim() : "localhost",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      code: "success",
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi hệ thống",
    });
  }
};
