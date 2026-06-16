import { Request, Response } from "express";
import { Driver } from "../../models/driver.model";

export const driversGet = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.query.page as string) || 1;
    const limitNum = parseInt(req.query.limit as string) || 10;
    const search = req.query.search;
    const skip = (pageNum - 1) * limitNum;
    const companyId = req.user.id; // From requireAuthCompany middleware

    let query: any = { isDeleted: false, companyId };

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { driverId: searchRegex },
        { driverName: searchRegex },
        { driverPhone: searchRegex },
      ];
    }

    const totalItems = await Driver.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const data = await Driver.find(query)
      .populate("companyId", "companyName companyCode")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      code: "success",
      data,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
    return;
  } catch (error) {
    console.error(error);
    res.json({ code: "error", message: "Không thể lấy danh sách tài xế" });
    return;
  }
};

export const createDriverPost = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.body;
    const companyId = req.user.id;
    
    const exist = await Driver.findOne({ driverId, isDeleted: false });
    if (exist) {
      res.json({ code: "error", message: "Mã CC/GPLX tài xế đã tồn tại" });
      return;
    }
    
    const newDriver = new Driver({ ...req.body, companyId });
    await newDriver.save();
    
    res.json({ code: "success", message: "Thêm tài xế thành công" });
    return;
  } catch (error) {
    console.error(error);
    res.json({ code: "error", message: "Lỗi khi thêm tài xế" });
    return;
  }
};

export const updateDriverPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    const companyId = req.user.id;

    if (driverId) {
      const exist = await Driver.findOne({
        driverId,
        _id: { $ne: id },
        isDeleted: false,
      });
      if (exist) {
        res.json({ code: "error", message: "Mã CC/GPLX tài xế đã tồn tại" });
        return;
      }
    }

    // Ensure we only update drivers belonging to this company
    const updated = await Driver.findOneAndUpdate(
      { _id: id, companyId },
      { ...req.body, companyId }, // Keep the companyId unchanged
      { new: true }
    );

    if (!updated) {
      res.json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }
    res.json({ code: "success", message: "Cập nhật thành công" });
    return;
  } catch (error) {
    console.error(error);
    res.json({ code: "error", message: "Lỗi khi cập nhật tài xế" });
    return;
  }
};

export const driverDetailGet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const data = await Driver.findOne({ _id: id, companyId });
    if (!data) {
      res.json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }

    res.json({ code: "success", data });
    return;
  } catch (error) {
    console.error(error);
    res.json({ code: "error", message: "Lỗi khi lấy thông tin tài xế" });
    return;
  }
};

export const softDeleteDriverPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const updated = await Driver.findOneAndUpdate(
      { _id: id, companyId },
      { isDeleted: true },
      { new: true }
    );

    if (!updated) {
      res.json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }

    res.json({ code: "success", message: "Đã đưa vào thùng rác" });
    return;
  } catch (error) {
    console.error(error);
    res.json({ code: "error", message: "Lỗi khi xóa tài xế" });
    return;
  }
};

export const driversTrashGet = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.query.page as string) || 1;
    const limitNum = parseInt(req.query.limit as string) || 10;
    const search = req.query.search;
    const skip = (pageNum - 1) * limitNum;
    const companyId = req.user.id;

    let query: any = { isDeleted: true, companyId };

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { driverId: searchRegex },
        { driverName: searchRegex },
        { driverPhone: searchRegex },
      ];
    }

    const totalItems = await Driver.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const data = await Driver.find(query)
      .populate("companyId", "companyName companyCode")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      code: "success",
      data,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
    return;
  } catch (error) {
    console.error(error);
    res.json({ code: "error", message: "Không thể lấy danh sách thùng rác" });
    return;
  }
};

export const restoreDriverPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const updated = await Driver.findOneAndUpdate(
      { _id: id, companyId },
      { isDeleted: false },
      { new: true }
    );

    if (!updated) {
      res.json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }

    res.json({ code: "success", message: "Đã khôi phục tài xế" });
    return;
  } catch (error) {
    console.error(error);
    res.json({ code: "error", message: "Lỗi khi khôi phục tài xế" });
    return;
  }
};

export const hardDeleteDriverDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const deleted = await Driver.findOneAndDelete({ _id: id, companyId });

    if (!deleted) {
      res.json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }

    res.json({ code: "success", message: "Đã xóa vĩnh viễn tài xế" });
    return;
  } catch (error) {
    console.error(error);
    res.json({ code: "error", message: "Lỗi khi xóa vĩnh viễn" });
    return;
  }
};
