import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AccountAdmin } from "../models/account-admin.model";

export const register = async (req: Request, res: Response) => {
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
