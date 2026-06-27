import { Request, Response } from "express";
import { AccountAdmin } from "../models/account-admin.model";

export const adminsGet = async (req: Request, res: Response) => {
  try {
    const { search, status, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: false };

    if (status && status !== "all") {
      query.isActive = status === "active" ? true : false;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
      ];
    }

    const totalItems = await AccountAdmin.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const adminList = await AccountAdmin.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: adminList,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Lấy danh sách tài khoản admin thất bại",
    });
  }
};

export const adminCreatePost = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role, status } = req.body;

    const existingUser = await AccountAdmin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        code: "error",
        message: "Email đã được sử dụng.",
      });
    }

    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccount = new AccountAdmin({
      fullName,
      email,
      role,
      password: hashedPassword,
      isActive: status === "active",
    });

    await newAccount.save();

    res.status(200).json({
      code: "success",
      message: "Tạo tài khoản thành công!",
      data: newAccount,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Đã xảy ra lỗi khi tạo tài khoản.",
    });
  }
};

export const adminEditPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, status } = req.body;

    const existingUser = await AccountAdmin.findOne({
      email,
      _id: { $ne: id },
    });
    if (existingUser) {
      return res.status(400).json({
        code: "error",
        message: "Email đã được sử dụng bởi người khác.",
      });
    }

    const admin = await AccountAdmin.findById(id);
    if (!admin) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy tài khoản admin.",
      });
    }

    admin.fullName = fullName;
    admin.email = email;
    admin.role = role;
    if (status === "active") admin.isActive = true;
    else if (status === "pending" || status === "banned")
      admin.isActive = false;

    await admin.save();

    res.status(200).json({
      code: "success",
      message: "Cập nhật tài khoản thành công!",
      data: admin,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Đã xảy ra lỗi khi cập nhật tài khoản.",
    });
  }
};

export const adminChangeStatusPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const admin = await AccountAdmin.findById(id);
    if (!admin) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy tài khoản admin.",
      });
    }

    if (status === "active") admin.isActive = true;
    else admin.isActive = false;

    await admin.save();

    res.status(200).json({
      code: "success",
      message: "Cập nhật trạng thái thành công!",
      data: admin,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Đã xảy ra lỗi khi cập nhật trạng thái.",
    });
  }
};

export const adminDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await AccountAdmin.findById(id);
    if (!admin) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy tài khoản admin.",
      });
    }

    admin.isDeleted = true;
    admin.deletedAt = new Date();
    await admin.save();

    res.status(200).json({
      code: "success",
      message: "Xóa tài khoản thành công!",
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Đã xảy ra lỗi khi xóa tài khoản.",
    });
  }
};

export const adminsTrashGet = async (req: Request, res: Response) => {
  try {
    const { search, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: true };

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
      ];
    }

    const totalItems = await AccountAdmin.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const adminList = await AccountAdmin.find(query)
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: adminList,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Lấy danh sách thùng rác thất bại",
    });
  }
};

export const adminRestorePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await AccountAdmin.findById(id);
    if (!admin) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy tài khoản admin.",
      });
    }

    admin.isDeleted = false;
    admin.deletedAt = undefined;
    await admin.save();

    res.status(200).json({
      code: "success",
      message: "Khôi phục tài khoản thành công!",
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Đã xảy ra lỗi khi khôi phục tài khoản.",
    });
  }
};

export const adminForceDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await AccountAdmin.findByIdAndDelete(id);

    res.status(200).json({
      code: "success",
      message: "Xóa vĩnh viễn thành công!",
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Đã xảy ra lỗi khi xóa vĩnh viễn.",
    });
  }
};
