import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ContainerProvider } from "../../models/container-provider.model";
import { Container } from "../../models/container.model";
import { redisClient } from "../../config/redis.config";

/**
 * Cài đặt của CHÍNH hãng tàu đang đăng nhập.
 *
 * Nguyên tắc như bên doanh nghiệp: id luôn lấy từ token (requireAuthProvider),
 * không bao giờ từ body/params.
 */

const MIN_PASSWORD_LENGTH = 6;

/** Xóa cookie đăng nhập với đúng bộ tùy chọn đã dùng lúc set (auth-provider.controller). */
const clearProviderCookie = (res: Response) => {
  res.clearCookie("tokenProvider", {
    httpOnly: true,
    sameSite: "lax",
    domain:
      process.env.NODE_ENV === "production"
        ? process.env.COOKIE_DOMAIN?.replace(/['"]/g, "").trim()
        : "localhost",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const [provider, totalContainers] = await Promise.all([
      ContainerProvider.findById(providerId).select(
        "bic_codes code name contact_email status createdAt",
      ),
      Container.countDocuments({ providerId, isDeleted: false }),
    ]);

    if (!provider) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    res.status(200).json({
      code: "success",
      data: {
        _id: provider._id,
        code: (provider as any).code,
        name: (provider as any).name,
        contact_email: (provider as any).contact_email,
        bic_codes: (provider as any).bic_codes || [],
        status: (provider as any).status,
        createdAt: (provider as any).createdAt,
        totalContainers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Lỗi khi lấy cài đặt",
    });
  }
};

/**
 * PATCH /client/provider/settings/profile — sửa tên hãng tàu.
 *
 * Cố tình KHÔNG cho tự sửa: contact_email (định danh đăng nhập), code (mã hãng
 * do cảng cấp, container tham chiếu tới) và status (tự bật ACTIVE là qua mặt
 * khâu xét duyệt). Những trường đó chỉ ban quản lý cảng đổi được.
 */
export const updateProfilePatch = async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name || "").trim();
    if (name.length < 2 || name.length > 150) {
      return res.status(400).json({
        code: "error",
        message: "Tên hãng tàu phải từ 2 đến 150 ký tự",
      });
    }

    await ContainerProvider.updateOne({ _id: req.user.id }, { name });

    res.status(200).json({
      code: "success",
      message: "Cập nhật thông tin hãng tàu thành công",
    });
  } catch (error) {
    console.error("Provider profile update error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật thông tin" });
  }
};

/**
 * PATCH /client/provider/settings/password — đổi mật khẩu.
 *
 * Sau khi đổi, hủy phiên trong Redis và xóa cookie: token cũ có thể đang nằm
 * trên máy khác, để nguyên thì đổi mật khẩu không đuổi được ai ra cả.
 */
export const changePasswordPatch = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        code: "error",
        message: "Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới",
      });
    }
    if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        code: "error",
        message: `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
      });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({
        code: "error",
        message: "Mật khẩu mới phải khác mật khẩu hiện tại",
      });
    }

    const provider = await ContainerProvider.findById(providerId).select("password");
    if (!provider) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    const matched = await bcrypt.compare(currentPassword, (provider as any).password);
    if (!matched) {
      return res
        .status(400)
        .json({ code: "error", message: "Mật khẩu hiện tại không đúng" });
    }

    (provider as any).password = await bcrypt.hash(newPassword, 10);
    await provider.save();

    await redisClient.del(`auth:provider:session:${providerId}`);
    clearProviderCookie(res);

    res.status(200).json({
      code: "success",
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
      requireRelogin: true,
    });
  } catch (error) {
    console.error("Provider change password error:", error);
    res.status(400).json({ code: "error", message: "Không thể đổi mật khẩu" });
  }
};

/** PATCH /client/provider/settings/logout-all — hủy phiên trên mọi thiết bị. */
export const logoutAllPatch = async (req: Request, res: Response) => {
  try {
    await redisClient.del(`auth:provider:session:${req.user.id}`);
    clearProviderCookie(res);
    res.status(200).json({
      code: "success",
      message: "Đã đăng xuất khỏi mọi thiết bị.",
      requireRelogin: true,
    });
  } catch (error) {
    console.error("Provider logout all error:", error);
    res.status(400).json({ code: "error", message: "Không thể đăng xuất" });
  }
};

export const updateBicCodes = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const { bic_codes } = req.body;

    if (!Array.isArray(bic_codes)) {
      return res.status(400).json({
        code: "error",
        message: "Định dạng mã BIC không hợp lệ",
      });
    }

    // Convert to uppercase and filter empty
    const validBicCodes = bic_codes
      .map((code) => code.toString().trim().toUpperCase())
      .filter((code) => code.length > 0);

    const provider = await ContainerProvider.findByIdAndUpdate(
      providerId,
      { bic_codes: validBicCodes },
      { new: true }
    ).select("bic_codes");

    if (!provider) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    res.status(200).json({
      code: "success",
      message: "Cập nhật mã BIC thành công",
      data: provider.bic_codes,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: "Lỗi khi cập nhật mã BIC",
    });
  }
};
