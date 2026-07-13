import { Request, Response } from "express";
import { AdminRole } from "../models/adminRole.model";
import { AccountAdmin } from "../models/account-admin.model";
import { invalidateRoleCache } from "../middlewares/rbac.middleware";
import {
  RESOURCES,
  ACTIONS,
  sanitizePermissions,
} from "../config/rbac.config";

/** Trả catalog resource/action để frontend dựng ma trận phân quyền. */
export const catalogGet = async (_req: Request, res: Response) => {
  res.status(200).json({
    code: "success",
    data: { resources: RESOURCES, actions: ACTIONS },
  });
};

/** Quyền của chính người đang đăng nhập — frontend dùng để ẩn/hiện menu & nút. */
export const myPermissionsGet = async (req: Request, res: Response) => {
  res.status(200).json({
    code: "success",
    data: {
      roleCode: req.user?.roleCode || null,
      isSuperAdmin: !!req.user?.isSuperAdmin,
      permissions: req.user?.permissions || [],
    },
  });
};

export const rolesGet = async (req: Request, res: Response) => {
  try {
    const { search, status, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = { isDeleted: false };
    if (status && status !== "ALL") query.status = status;
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ roleCode: searchRegex }, { roleName: searchRegex }];
    }

    const totalItems = await AdminRole.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);
    const roleList = await AdminRole.find(query)
      .sort({ isSystem: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Đếm số tài khoản đang dùng mỗi role (để hiển thị & chặn xóa).
    const counts = await AccountAdmin.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const data = roleList.map((r) => ({
      ...r.toObject(),
      userCount: countMap.get(String(r._id)) || 0,
    }));

    res.status(200).json({
      code: "success",
      data,
      pagination: { currentPage: pageNum, totalPages, totalItems, limit: limitNum },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể lấy danh sách vai trò" });
  }
};

export const roleDetailGet = async (req: Request, res: Response) => {
  try {
    const role = await AdminRole.findById(req.params.id);
    if (!role) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy vai trò" });
    }
    res.status(200).json({ code: "success", data: role });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể lấy thông tin vai trò" });
  }
};

export const createRolePost = async (req: Request, res: Response) => {
  try {
    const { roleCode, roleName, description, permissions } = req.body;

    const existRole = await AdminRole.findOne({ roleCode: roleCode?.toUpperCase() });
    if (existRole) {
      return res.status(400).json({
        code: "error",
        message: existRole.isDeleted
          ? "Mã vai trò này đang nằm trong thùng rác. Hãy khôi phục hoặc xóa vĩnh viễn trước."
          : "Mã vai trò đã tồn tại",
      });
    }

    const { valid, permissions: cleaned, message } = sanitizePermissions(permissions);
    if (!valid) return res.status(400).json({ code: "error", message });

    await AdminRole.create({
      roleCode,
      roleName,
      description: description || "",
      permissions: cleaned,
      isSystem: false,
    });

    res.status(200).json({ code: "success", message: "Tạo vai trò thành công" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể tạo vai trò" });
  }
};

export const updateRolePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roleCode, roleName, description, permissions } = req.body;

    const role = await AdminRole.findById(id);
    if (!role) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy vai trò" });
    }
    if (role.isSystem) {
      return res.status(400).json({
        code: "error",
        message: "Đây là vai trò hệ thống, không thể chỉnh sửa!",
      });
    }

    // roleCode trùng với role khác?
    const dup = await AdminRole.findOne({
      _id: { $ne: id },
      roleCode: roleCode?.toUpperCase(),
    });
    if (dup) {
      return res.status(400).json({ code: "error", message: "Mã vai trò đã tồn tại" });
    }

    const { valid, permissions: cleaned, message } = sanitizePermissions(permissions);
    if (!valid) return res.status(400).json({ code: "error", message });

    role.roleCode = roleCode;
    role.roleName = roleName;
    role.description = description || "";
    role.permissions = cleaned as any;
    await role.save();

    await invalidateRoleCache(String(id)); // áp quyền mới tức thì

    res.status(200).json({ code: "success", message: "Cập nhật vai trò thành công" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể cập nhật vai trò" });
  }
};

export const updateStatusPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const role = await AdminRole.findById(id);
    if (!role) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy vai trò" });
    }
    if (role.isSystem) {
      return res.status(400).json({
        code: "error",
        message: "Đây là vai trò hệ thống, không thể khóa trạng thái!",
      });
    }

    role.status = newStatus;
    await role.save();
    await invalidateRoleCache(String(id));

    res.status(200).json({ code: "success", message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể cập nhật trạng thái" });
  }
};

export const softDeleteRolePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = await AdminRole.findById(id);
    if (!role) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy vai trò" });
    }
    if (role.isSystem) {
      return res.status(400).json({
        code: "error",
        message: "Đây là vai trò hệ thống, không thể xóa!",
      });
    }

    // Chặn xóa role đang được sử dụng.
    const inUse = await AccountAdmin.countDocuments({ role: id, isDeleted: false });
    if (inUse > 0) {
      return res.status(400).json({
        code: "error",
        message: `Không thể xóa: đang có ${inUse} tài khoản dùng vai trò này. Hãy chuyển họ sang vai trò khác trước.`,
      });
    }

    role.isDeleted = true;
    role.deletedAt = new Date();
    await role.save();
    await invalidateRoleCache(String(id));

    res.status(200).json({ code: "success", message: "Đã đưa vai trò vào thùng rác" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể xóa vai trò" });
  }
};

export const trashRolesGet = async (req: Request, res: Response) => {
  try {
    const { search, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = { isDeleted: true };
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ roleCode: searchRegex }, { roleName: searchRegex }];
    }

    const totalItems = await AdminRole.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);
    const roleList = await AdminRole.find(query)
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: roleList,
      pagination: { currentPage: pageNum, totalPages, totalItems, limit: limitNum },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể lấy danh sách đã xóa" });
  }
};

export const restoreRolePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await AdminRole.findById(id);
    if (!role) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy vai trò" });
    }

    await AdminRole.updateOne(
      { _id: id },
      { $set: { isDeleted: false }, $unset: { deletedAt: "" } },
    );

    res.status(200).json({ code: "success", message: "Khôi phục vai trò thành công" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể khôi phục vai trò" });
  }
};

export const hardDeleteRoleDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await AdminRole.findById(id);
    if (!role) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy vai trò" });
    }
    if (role.isSystem) {
      return res.status(400).json({
        code: "error",
        message: "Đây là vai trò hệ thống, không thể xóa vĩnh viễn!",
      });
    }

    const inUse = await AccountAdmin.countDocuments({ role: id });
    if (inUse > 0) {
      return res.status(400).json({
        code: "error",
        message: `Không thể xóa: đang có ${inUse} tài khoản dùng vai trò này.`,
      });
    }

    await AdminRole.findByIdAndDelete(id);
    await invalidateRoleCache(String(id));

    res.status(200).json({ code: "success", message: "Xóa vĩnh viễn vai trò thành công" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Không thể xóa vĩnh viễn" });
  }
};
