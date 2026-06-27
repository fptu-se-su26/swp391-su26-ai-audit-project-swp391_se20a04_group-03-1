import { Request, Response } from "express";
import { CompanyRole } from "../models/companyRole.model";

export const rolesGet = async (req: Request, res: Response) => {
  try {
    const { search, status, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: false };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { roleCode: searchRegex },
        { roleName: searchRegex },
      ];
    }

    const totalItems = await CompanyRole.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const roleList = await CompanyRole.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: roleList,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể lấy danh sách loại hình doanh nghiệp",
    });
  }
};

export const roleDetailGet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await CompanyRole.findById(id);
    if (!role) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin loại hình",
      });
    }
    res.status(200).json({
      code: "success",
      data: role,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể lấy thông tin loại hình",
    });
  }
};

export const createRolePost = async (req: Request, res: Response) => {
  try {
    const { roleCode } = req.body;
    const existRole = await CompanyRole.findOne({ roleCode });

    if (existRole) {
      if (existRole.isDeleted) {
        return res.status(400).json({
          code: "error",
          message: "Mã loại hình này đang nằm trong thùng rác. Hãy khôi phục hoặc xóa vĩnh viễn trước.",
        });
      }
      return res.status(400).json({
        code: "error",
        message: "Mã loại hình đã tồn tại",
      });
    }

    const newRole = new CompanyRole(req.body);
    await newRole.save();

    res.status(200).json({
      code: "success",
      message: "Thêm mới loại hình doanh nghiệp thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể tạo loại hình doanh nghiệp",
    });
  }
};

export const updateRolePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roleCode } = req.body;

    const currentRole = await CompanyRole.findById(id);
    if (!currentRole) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy thông tin loại hình" });
    }
    const protectedRoles = ["transport", "provider"];
    if (protectedRoles.includes(currentRole.roleCode.toLowerCase())) {
      return res.status(400).json({ code: "error", message: "Đây là vai trò hệ thống, không thể chỉnh sửa!" });
    }

    const existRole = await CompanyRole.findOne({
      _id: { $ne: id },
      roleCode: roleCode,
    });

    if (existRole) {
      if (existRole.isDeleted) {
        return res.status(400).json({
          code: "error",
          message: "Mã loại hình này đang được sử dụng bởi một loại hình trong thùng rác.",
        });
      }
      return res.status(400).json({
        code: "error",
        message: "Mã loại hình đã tồn tại",
      });
    }

    await CompanyRole.updateOne({ _id: id }, req.body);

    res.status(200).json({
      code: "success",
      message: "Cập nhật loại hình doanh nghiệp thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể cập nhật loại hình doanh nghiệp",
    });
  }
};

export const updateStatusPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const existRole = await CompanyRole.findById(id);
    if (!existRole) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin loại hình",
      });
    }

    const protectedRoles = ["transport", "provider"];
    if (protectedRoles.includes(existRole.roleCode.toLowerCase())) {
      return res.status(400).json({ code: "error", message: "Đây là vai trò hệ thống, không thể khóa trạng thái!" });
    }

    await CompanyRole.updateOne({ _id: id }, { status: newStatus });

    res.status(200).json({
      code: "success",
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể cập nhật trạng thái",
    });
  }
};

export const softDeleteRolePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existRole = await CompanyRole.findById(id);
    if (!existRole) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin loại hình",
      });
    }

    const protectedRoles = ["transport", "provider"];
    if (protectedRoles.includes(existRole.roleCode.toLowerCase())) {
      return res.status(400).json({ code: "error", message: "Đây là vai trò hệ thống, không thể xóa!" });
    }

    await CompanyRole.updateOne({ _id: id }, { isDeleted: true, deletedAt: new Date() });

    res.status(200).json({
      code: "success",
      message: "Xóa loại hình thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể xóa loại hình",
    });
  }
};

export const trashRolesGet = async (req: Request, res: Response) => {
  try {
    const { search, status, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: true };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { roleCode: searchRegex },
        { roleName: searchRegex },
      ];
    }

    const totalItems = await CompanyRole.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const roleList = await CompanyRole.find(query)
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: roleList,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể lấy danh sách loại hình đã xóa",
    });
  }
};

export const restoreRolePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existRole = await CompanyRole.findById(id);
    if (!existRole) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin loại hình",
      });
    }

    await CompanyRole.updateOne(
      { _id: id },
      { $set: { isDeleted: false }, $unset: { deletedAt: "" } }
    );

    res.status(200).json({
      code: "success",
      message: "Khôi phục loại hình thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể khôi phục loại hình",
    });
  }
};

export const hardDeleteRoleDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existRole = await CompanyRole.findById(id);
    if (!existRole) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin loại hình",
      });
    }

    const protectedRoles = ["transport", "provider"];
    if (protectedRoles.includes(existRole.roleCode.toLowerCase())) {
      return res.status(400).json({ code: "error", message: "Đây là vai trò hệ thống, không thể xóa vĩnh viễn!" });
    }

    await CompanyRole.findByIdAndDelete(id);

    res.status(200).json({
      code: "success",
      message: "Xóa vĩnh viễn loại hình thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể xóa vĩnh viễn",
    });
  }
};
