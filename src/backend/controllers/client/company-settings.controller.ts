import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Company } from "../../models/company.model";
import { Driver } from "../../models/driver.model";
import { Truck } from "../../models/truck.model";
import { redisClient } from "../../config/redis.config";

/**
 * Cài đặt tài khoản của CHÍNH doanh nghiệp đang đăng nhập.
 *
 * Nguyên tắc xuyên suốt: id luôn lấy từ token (requireAuthCompany), không bao
 * giờ lấy từ body/params — nếu không, một doanh nghiệp sửa được hồ sơ của
 * doanh nghiệp khác chỉ bằng cách đổi một trường trong request.
 */

const MIN_PASSWORD_LENGTH = 6;

/** Xóa cookie đăng nhập với đúng bộ tùy chọn đã dùng lúc set (auth.controller). */
const clearCompanyCookie = (res: Response) => {
  res.clearCookie("tokenCompany", {
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

/** GET /client/settings/me — hồ sơ doanh nghiệp + vài con số của đội xe. */
export const meGet = async (req: Request, res: Response) => {
  try {
    const companyId = req.user.id;

    const [company, drivers, trucks] = await Promise.all([
      Company.findById(companyId)
        .select("-password")
        .populate("companyRole", "roleCode roleName description")
        .lean(),
      Driver.countDocuments({ companyId, isDeleted: false }),
      Truck.countDocuments({ companyId, isDeleted: false }),
    ]);

    if (!company) {
      return res
        .status(400)
        .json({ code: "error", message: "Không tìm thấy thông tin doanh nghiệp" });
    }

    const role: any = (company as any).companyRole;

    res.status(200).json({
      code: "success",
      data: {
        _id: company._id,
        companyCode: (company as any).companyCode,
        companyName: (company as any).companyName,
        contactPerson: (company as any).contactPerson,
        contactPhone: (company as any).contactPhone,
        email: (company as any).email,
        status: (company as any).status,
        createdAt: (company as any).createdAt,
        roleCode: role?.roleCode || null,
        roleName: role?.roleName || null,
        totalDrivers: drivers,
        totalTrucks: trucks,
      },
    });
  } catch (error) {
    console.error("Company profile get error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể lấy thông tin doanh nghiệp" });
  }
};

/**
 * PATCH /client/settings/me — sửa thông tin liên hệ.
 *
 * Cố tình KHÔNG cho tự sửa: email (định danh đăng nhập), companyCode (mã số do
 * cảng cấp, dùng để đối chiếu), status (tự bật Active là qua mặt khâu xét
 * duyệt) và companyRole (loại hình doanh nghiệp quyết định quyền truy cập).
 * Những trường đó chỉ ban quản lý cảng đổi được ở trang admin.
 */
export const meUpdatePatch = async (req: Request, res: Response) => {
  try {
    const companyId = req.user.id;
    const companyName = String(req.body.companyName || "").trim();
    const contactPerson = String(req.body.contactPerson || "").trim();
    const contactPhone = String(req.body.contactPhone || "").trim();

    if (companyName.length < 2 || companyName.length > 150) {
      return res.status(400).json({
        code: "error",
        message: "Tên doanh nghiệp phải từ 2 đến 150 ký tự",
      });
    }
    if (contactPerson.length < 2 || contactPerson.length > 100) {
      return res.status(400).json({
        code: "error",
        message: "Tên người liên hệ phải từ 2 đến 100 ký tự",
      });
    }
    if (!/^0\d{9,10}$/.test(contactPhone)) {
      return res.status(400).json({
        code: "error",
        message: "Số điện thoại phải gồm 10-11 chữ số và bắt đầu bằng 0",
      });
    }

    await Company.updateOne(
      { _id: companyId },
      { companyName, contactPerson, contactPhone },
    );

    res.status(200).json({
      code: "success",
      message: "Cập nhật thông tin doanh nghiệp thành công",
    });
  } catch (error) {
    console.error("Company profile update error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật thông tin" });
  }
};

/**
 * PATCH /client/settings/password — đổi mật khẩu.
 *
 * Sau khi đổi, hủy phiên trong Redis và xóa cookie: token cũ có thể đang nằm
 * trên máy khác, để nguyên thì đổi mật khẩu không đuổi được ai ra cả.
 */
export const changePasswordPatch = async (req: Request, res: Response) => {
  try {
    const companyId = req.user.id;
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

    const company = await Company.findById(companyId).select("password");
    if (!company) {
      return res
        .status(400)
        .json({ code: "error", message: "Không tìm thấy thông tin doanh nghiệp" });
    }

    const matched = await bcrypt.compare(currentPassword, company.password);
    if (!matched) {
      return res
        .status(400)
        .json({ code: "error", message: "Mật khẩu hiện tại không đúng" });
    }

    company.password = await bcrypt.hash(newPassword, 10);
    await company.save();

    await redisClient.del(`auth:company:session:${companyId}`);
    clearCompanyCookie(res);

    res.status(200).json({
      code: "success",
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
      requireRelogin: true,
    });
  } catch (error) {
    console.error("Company change password error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể đổi mật khẩu" });
  }
};

/** PATCH /client/settings/logout-all — hủy phiên đăng nhập trên mọi thiết bị. */
export const logoutAllPatch = async (req: Request, res: Response) => {
  try {
    await redisClient.del(`auth:company:session:${req.user.id}`);
    clearCompanyCookie(res);
    res.status(200).json({
      code: "success",
      message: "Đã đăng xuất khỏi mọi thiết bị.",
      requireRelogin: true,
    });
  } catch (error) {
    console.error("Company logout all error:", error);
    res.status(400).json({ code: "error", message: "Không thể đăng xuất" });
  }
};
