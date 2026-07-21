import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AccountAdmin } from "../models/account-admin.model";
import { redisClient } from "../config/redis.config";

/**
 * Hồ sơ của CHÍNH người đang đăng nhập.
 *
 * Tách khỏi admin.controller (quản lý tài khoản người khác) vì khác hoàn toàn về
 * phân quyền: các API ở đây không cần quyền `settings.admins` — ai đăng nhập
 * cũng được xem và sửa hồ sơ của mình, và CHỈ của mình (id luôn lấy từ token,
 * không bao giờ lấy từ body/params).
 */

const clearAdminCookie = (res: Response) => {
  res.clearCookie("tokenAdmin", {
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
};

/** GET /settings/me — thông tin tài khoản đang đăng nhập. */
export const meGet = async (req: Request, res: Response) => {
  try {
    const account = await AccountAdmin.findById(req.user?.id)
      .select("-password")
      .populate({ path: "role", select: "roleCode roleName" })
      .populate({ path: "gateId", select: "name type" })
      .lean();

    if (!account) {
      return res
        .status(400)
        .json({ code: "error", message: "Không tìm thấy tài khoản" });
    }

    const role: any = account.role;
    const gate: any = account.gateId;

    res.status(200).json({
      code: "success",
      data: {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        isActive: account.isActive,
        createdAt: (account as any).createdAt,
        roleCode: role?.roleCode || null,
        roleName: role?.roleName || null,
        gateName: gate?.name || null,
        isSuperAdmin: !!req.user?.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error("Profile get error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể lấy thông tin tài khoản" });
  }
};

/**
 * PATCH /settings/me — đổi họ tên.
 * Cố tình KHÔNG cho tự đổi email và vai trò: email là định danh đăng nhập, vai trò
 * là quyền lực — tự sửa được sẽ thành lỗ hổng leo thang đặc quyền.
 */
export const meUpdatePatch = async (req: Request, res: Response) => {
  try {
    const fullName = String(req.body?.fullName || "").trim();

    if (fullName.length < 2 || fullName.length > 100) {
      return res.status(400).json({
        code: "error",
        message: "Họ tên phải từ 2 đến 100 ký tự",
      });
    }

    const account = await AccountAdmin.findByIdAndUpdate(
      req.user?.id,
      { fullName },
      { new: true, runValidators: true },
    ).select("fullName email");

    if (!account) {
      return res
        .status(400)
        .json({ code: "error", message: "Không tìm thấy tài khoản" });
    }

    res.status(200).json({
      code: "success",
      message: "Cập nhật thông tin thành công",
      data: { fullName: account.fullName, email: account.email },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật thông tin" });
  }
};

/**
 * PATCH /settings/me/password — tự đổi mật khẩu.
 * Đổi xong xóa session Redis: mọi thiết bị (kể cả thiết bị hiện tại) phải đăng
 * nhập lại bằng mật khẩu mới — đây là hành vi đúng nếu mật khẩu cũ bị lộ.
 */
export const changePasswordPatch = async (req: Request, res: Response) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        code: "error",
        message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        code: "error",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({
        code: "error",
        message: "Mật khẩu mới phải khác mật khẩu hiện tại",
      });
    }

    const account = await AccountAdmin.findById(req.user?.id);
    if (!account) {
      return res
        .status(400)
        .json({ code: "error", message: "Không tìm thấy tài khoản" });
    }

    const matched = await bcrypt.compare(currentPassword, account.password);
    if (!matched) {
      return res
        .status(400)
        .json({ code: "error", message: "Mật khẩu hiện tại không chính xác" });
    }

    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(newPassword, salt);
    await account.save();

    await redisClient.del(`auth:session:${account._id}`);
    clearAdminCookie(res);

    res.status(200).json({
      code: "success",
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
      data: { requireRelogin: true },
    });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể đổi mật khẩu" });
  }
};

/**
 * PATCH /settings/me/logout-all — đăng xuất khỏi mọi thiết bị.
 * Hệ thống chỉ giữ 1 session/tài khoản trong Redis, nên xóa key là vô hiệu hóa
 * toàn bộ token đang lưu hành của tài khoản này.
 */
export const logoutAllPatch = async (req: Request, res: Response) => {
  try {
    await redisClient.del(`auth:session:${req.user?.id}`);
    clearAdminCookie(res);
    res.status(200).json({
      code: "success",
      message: "Đã đăng xuất khỏi tất cả thiết bị",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(400).json({ code: "error", message: "Không thể đăng xuất" });
  }
};
