import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Driver } from "../../models/driver.model";
import { AccountAdmin } from "../../models/account-admin.model";
import {
  issueMobileToken,
  revokeMobileSession,
} from "../../helpers/mobile-token.helper";

// Một tài khoản admin được coi là "Quản lý cổng" (được dùng app mobile) nếu role
// của họ là GATE_MANAGER, hoặc là super admin (isSystem) để tiện kiểm thử.
const isGateManagerRole = (role: any): boolean =>
  !!role && (role.roleCode === "GATE_MANAGER" || role.isSystem === true);

// POST /api/mobile/auth/login
// Đăng nhập hợp nhất: backend tự xác định vai trò theo tài khoản
// (Tài xế trong collection drivers, Quản lý cổng là AccountAdmin role GATE_MANAGER).
export const loginPost = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email).toLowerCase().trim();
    const { password } = req.body;

    // 1. Thử vai trò Tài xế.
    const driver = await Driver.findOne({ email, isDeleted: false }).populate(
      "companyId",
      "companyName companyCode",
    );
    if (driver && driver.password) {
      const isMatch = await bcrypt.compare(password, driver.password);
      if (isMatch) {
        if (driver.status !== "Active") {
          return res.status(400).json({
            code: "error",
            message: "Tài khoản của bạn chưa được kích hoạt",
          });
        }
        const token = await issueMobileToken(String(driver._id), "driver");
        return res.status(200).json({
          code: "success",
          message: "Đăng nhập thành công",
          data: {
            token,
            role: "driver",
            user: {
              id: driver._id,
              driverId: driver.driverId,
              fullName: driver.driverName,
              phone: driver.driverPhone,
              email: driver.email,
              company: driver.companyId,
            },
          },
        });
      }
    }

    // 2. Thử vai trò Quản lý cổng (AccountAdmin có role GATE_MANAGER).
    const staff = await AccountAdmin.findOne({ email, isDeleted: false })
      .populate("role", "roleCode roleName isSystem")
      .populate("gateId", "name type");
    if (staff && isGateManagerRole(staff.role)) {
      const isMatch = await bcrypt.compare(password, staff.password);
      if (isMatch) {
        if (!staff.isActive) {
          return res.status(400).json({
            code: "error",
            message: "Tài khoản của bạn chưa được kích hoạt",
          });
        }
        const token = await issueMobileToken(String(staff._id), "gate_manager");
        return res.status(200).json({
          code: "success",
          message: "Đăng nhập thành công",
          data: {
            token,
            role: "gate_manager",
            user: {
              id: staff._id,
              fullName: staff.fullName,
              email: staff.email,
              gate: staff.gateId,
            },
          },
        });
      }
    }

    // Không khớp tài khoản nào.
    return res.status(400).json({
      code: "error",
      message: "Tài khoản hoặc mật khẩu không chính xác",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: "error", message: "Không thể đăng nhập" });
  }
};

// GET /api/mobile/auth/me  (requireMobileAuth)
export const meGet = async (req: Request, res: Response) => {
  try {
    if (req.user.role === "driver") {
      const driver = await Driver.findById(req.user.id).populate(
        "companyId",
        "companyName companyCode",
      );
      if (!driver || driver.isDeleted) {
        return res
          .status(404)
          .json({ code: "error", message: "Không tìm thấy tài khoản" });
      }
      return res.status(200).json({
        code: "success",
        data: {
          role: "driver",
          id: driver._id,
          driverId: driver.driverId,
          fullName: driver.driverName,
          phone: driver.driverPhone,
          email: driver.email,
          company: driver.companyId,
        },
      });
    }

    const staff = await AccountAdmin.findById(req.user.id)
      .populate("role", "roleCode roleName isSystem")
      .populate("gateId", "name type");
    if (!staff || staff.isDeleted || !isGateManagerRole(staff.role)) {
      return res
        .status(404)
        .json({ code: "error", message: "Không tìm thấy tài khoản" });
    }
    return res.status(200).json({
      code: "success",
      data: {
        role: "gate_manager",
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        gate: staff.gateId,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: "error", message: "Không thể lấy thông tin tài khoản" });
  }
};

// POST /api/mobile/auth/logout  (requireMobileAuth)
export const logoutPost = async (req: Request, res: Response) => {
  try {
    await revokeMobileSession(String(req.user.id));
    return res.status(200).json({ code: "success", message: "Đã đăng xuất" });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: "error", message: "Không thể đăng xuất" });
  }
};
