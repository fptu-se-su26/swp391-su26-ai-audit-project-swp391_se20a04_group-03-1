import { Request, Response } from "express";
import { Container } from "../models/container.model";
import { ContainerProvider } from "../models/container-provider.model";

export const getContainers = async (req: Request, res: Response) => {
  try {
    const { search, type, status, portStatus, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: false };

    if (type && type !== "ALL") {
      query.type = type;
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (portStatus && portStatus !== "ALL") {
      query.portStatus = portStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.number = searchRegex;
    }

    const totalItems = await Container.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const containerList = await Container.find(query)
      .populate("providerId", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: containerList,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Không thể lấy danh sách container",
    });
  }
};

export const getContainerDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const container = await Container.findOne({ _id: id, isDeleted: false }).populate("providerId", "name code bic_codes");

    if (!container) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy container",
      });
    }

    res.status(200).json({
      code: "success",
      data: container,
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Không thể lấy thông tin container",
    });
  }
};

export const createContainerPost = async (req: Request, res: Response) => {
  try {
    const { number, type, status, portStatus, providerId } = req.body;

    const existContainer = await Container.findOne({ number: number.toUpperCase() });
    if (existContainer) {
      if (existContainer.isDeleted) {
        return res.status(400).json({
          code: "error",
          message: "Mã container này đã bị xóa và đang nằm trong thùng rác. Vui lòng khôi phục lại!",
        });
      }
      return res.status(400).json({
        code: "error",
        message: "Mã container đã tồn tại trong hệ thống",
      });
    }

    const newContainer = new Container({
      number: number.toUpperCase(),
      type,
      status,
      portStatus: portStatus || "Chưa nhập cảng",
      providerId,
    });

    await newContainer.save();

    res.status(200).json({
      code: "success",
      message: "Tạo container thành công",
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Không thể tạo container: " + (error as Error).message,
    });
  }
};

export const updateContainerPatch = async (req: Request, res: Response) => {
  try {
    const { id, number, type, status, portStatus, providerId } = req.body;

    const existContainer = await Container.findOne({
      _id: { $ne: id },
      number: number.toUpperCase(),
    });

    if (existContainer) {
      if (existContainer.isDeleted) {
        return res.status(400).json({
          code: "error",
          message: "Mã container này đang nằm trong Thùng rác, không thể sử dụng để cập nhật!",
        });
      }
      return res.status(400).json({
        code: "error",
        message: "Mã container đã tồn tại trong hệ thống",
      });
    }

    const container = await Container.findOne({ _id: id });
    if (!container) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy container",
      });
    }

    container.number = number.toUpperCase();
    container.type = type;
    container.status = status;
    if (portStatus) {
      container.portStatus = portStatus;
    }
    if (providerId) {
      container.providerId = providerId;
    }
    
    await container.save();

    res.status(200).json({
      code: "success",
      message: "Cập nhật container thành công",
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Không thể cập nhật container",
    });
  }
};

export const softDeleteContainerPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existContainer = await Container.findOne({ _id: id });
    if (!existContainer) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin container",
      });
    }

    existContainer.isDeleted = true;
    await existContainer.save();

    res.status(200).json({
      code: "success",
      message: "Đã chuyển container vào thùng rác",
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Không thể xóa container",
    });
  }
};

export const trashContainersGet = async (req: Request, res: Response) => {
  try {
    const { search, type, status, portStatus, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: true };

    if (type && type !== "ALL") {
      query.type = type;
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (portStatus && portStatus !== "ALL") {
      query.portStatus = portStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.number = searchRegex;
    }

    const totalItems = await Container.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const containerList = await Container.find(query)
      .populate("providerId", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: containerList,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Không thể lấy danh sách container đã xóa",
    });
  }
};

export const restoreContainerPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existContainer = await Container.findOne({ _id: id });
    if (!existContainer) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin container",
      });
    }

    existContainer.isDeleted = false;
    await existContainer.save();

    res.status(200).json({
      code: "success",
      message: "Khôi phục container thành công",
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Không thể khôi phục container",
    });
  }
};

export const hardDeleteContainerDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existContainer = await Container.findOne({ _id: id });
    if (!existContainer) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin container",
      });
    }
    
    await Container.deleteOne({ _id: id });
    
    res.status(200).json({
      code: "success",
      message: "Xóa vĩnh viễn container thành công",
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Không thể xóa vĩnh viễn container",
    });
  }
};
