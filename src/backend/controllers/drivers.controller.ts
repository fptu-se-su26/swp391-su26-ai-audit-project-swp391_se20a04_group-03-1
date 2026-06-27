import { Request, Response } from "express";
import { Driver } from "../models/driver.model";
import { Company } from "../models/company.model";

export const driversGet = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.query.page as string) || 1;
    const limitNum = parseInt(req.query.limit as string) || 10;
    const search = req.query.search;
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: false };

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

    res.status(200).json({
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
    res.status(400).json({ code: "error", message: "Không thể lấy danh sách tài xế" });
    return;
  }
};

export const createDriverPost = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.body;
    const exist = await Driver.findOne({ driverId, isDeleted: false });
    if (exist) {
      res.status(400).json({ code: "error", message: "Mã CC/GPLX tài xế đã tồn tại" });
      return;
    }
    const newDriver = new Driver(req.body);
    await newDriver.save();
    res.status(200).json({ code: "success", message: "Thêm tài xế thành công" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi thêm tài xế" });
    return;
  }
};

export const updateDriverPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (driverId) {
      const exist = await Driver.findOne({
        driverId,
        _id: { $ne: id },
        isDeleted: false,
      });
      if (exist) {
        res.status(400).json({ code: "error", message: "Mã CC/GPLX tài xế đã tồn tại" });
        return;
      }
    }

    const updated = await Driver.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(400).json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }
    res.status(200).json({ code: "success", message: "Cập nhật thành công" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi cập nhật tài xế" });
    return;
  }
};

export const driverDetailGet = async (req: Request, res: Response) => {
  try {
    const data = await Driver.findById(req.params.id).populate(
      "companyId",
      "companyName companyCode",
    );
    if (!data) {
      res.status(400).json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }
    res.status(200).json({ code: "success", data });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi lấy chi tiết tài xế" });
    return;
  }
};

export const softDeleteDriverPatch = async (req: Request, res: Response) => {
  try {
    const data = await Driver.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    if (!data) {
      res.status(400).json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }
    res.status(200).json({ code: "success", message: "Đã chuyển tài xế vào thùng rác" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi xóa tài xế" });
    return;
  }
};

export const driversTrashGet = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.query.page as string) || 1;
    const limitNum = parseInt(req.query.limit as string) || 10;
    const search = req.query.search;
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: true };
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ driverId: searchRegex }, { driverName: searchRegex }];
    }

    const totalItems = await Driver.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);
    const data = await Driver.find(query)
      .populate("companyId", "companyName companyCode")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
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
    res.status(400).json({ code: "error", message: "Lỗi khi lấy thùng rác tài xế" });
    return;
  }
};

export const restoreDriverPatch = async (req: Request, res: Response) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy tài xế" });
    }

    const company = await Company.findById(driver.companyId);
    if (company && company.isDeleted) {
      return res.status(400).json({
        code: "error",
        message: "Không thể khôi phục tài xế vì công ty quản lý đang nằm trong thùng rác"
      });
    }

    driver.isDeleted = false;
    await driver.save();

    res.status(200).json({ code: "success", message: "Khôi phục tài xế thành công" });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi khi khôi phục tài xế" });
    return;
  }
};

export const hardDeleteDriverDelete = async (req: Request, res: Response) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.status(200).json({ code: "success", message: "Xóa vĩnh viễn tài xế thành công" });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi khi xóa vĩnh viễn tài xế" });
    return;
  }
};
