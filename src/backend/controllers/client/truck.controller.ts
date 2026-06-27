import { Request, Response } from "express";
import { Truck } from "../../models/truck.model";

export const trucksGet = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.query.page as string) || 1;
    const limitNum = parseInt(req.query.limit as string) || 10;
    const search = req.query.search;
    const skip = (pageNum - 1) * limitNum;
    const companyId = req.user.id;

    let query: any = { isDeleted: false, companyId };

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { truckPlate: searchRegex },
        { truckType: searchRegex },
      ];
    }

    const totalItems = await Truck.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const data = await Truck.find(query)
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
    res.status(400).json({ code: "error", message: "Không thể lấy danh sách xe" });
    return;
  }
};

export const createTruckPost = async (req: Request, res: Response) => {
  try {
    const { truckPlate } = req.body;
    const companyId = req.user.id;
    
    const exist = await Truck.findOne({ truckPlate, isDeleted: false });
    if (exist) {
      res.status(400).json({ code: "error", message: "Biển số xe đã tồn tại" });
      return;
    }
    
    const newTruck = new Truck({ ...req.body, companyId });
    await newTruck.save();
    
    res.status(200).json({ code: "success", message: "Thêm xe thành công" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi thêm xe" });
    return;
  }
};

export const updateTruckPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { truckPlate } = req.body;
    const companyId = req.user.id;

    if (truckPlate) {
      const exist = await Truck.findOne({
        truckPlate,
        _id: { $ne: id },
        isDeleted: false,
      });
      if (exist) {
        res.status(400).json({ code: "error", message: "Biển số xe đã tồn tại" });
        return;
      }
    }

    const updated = await Truck.findOneAndUpdate(
      { _id: id, companyId },
      { ...req.body, companyId },
      { new: true }
    );

    if (!updated) {
      res.status(400).json({ code: "error", message: "Không tìm thấy xe" });
      return;
    }
    res.status(200).json({ code: "success", message: "Cập nhật thành công" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi cập nhật xe" });
    return;
  }
};

export const truckDetailGet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const data = await Truck.findOne({ _id: id, companyId });
    if (!data) {
      res.status(400).json({ code: "error", message: "Không tìm thấy xe" });
      return;
    }

    res.status(200).json({ code: "success", data });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi lấy thông tin xe" });
    return;
  }
};

export const softDeleteTruckPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const updated = await Truck.findOneAndUpdate(
      { _id: id, companyId },
      { isDeleted: true },
      { new: true }
    );

    if (!updated) {
      res.status(400).json({ code: "error", message: "Không tìm thấy xe" });
      return;
    }

    res.status(200).json({ code: "success", message: "Đã đưa vào thùng rác" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi xóa xe" });
    return;
  }
};

export const trucksTrashGet = async (req: Request, res: Response) => {
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
        { truckPlate: searchRegex },
        { truckType: searchRegex },
      ];
    }

    const totalItems = await Truck.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const data = await Truck.find(query)
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
    res.status(400).json({ code: "error", message: "Không thể lấy danh sách thùng rác" });
    return;
  }
};

export const restoreTruckPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const updated = await Truck.findOneAndUpdate(
      { _id: id, companyId },
      { isDeleted: false },
      { new: true }
    );

    if (!updated) {
      res.status(400).json({ code: "error", message: "Không tìm thấy xe" });
      return;
    }

    res.status(200).json({ code: "success", message: "Đã khôi phục xe" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi khôi phục xe" });
    return;
  }
};

export const hardDeleteTruckDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const deleted = await Truck.findOneAndDelete({ _id: id, companyId });

    if (!deleted) {
      res.status(400).json({ code: "error", message: "Không tìm thấy xe" });
      return;
    }

    res.status(200).json({ code: "success", message: "Đã xóa vĩnh viễn xe" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi xóa vĩnh viễn" });
    return;
  }
};
