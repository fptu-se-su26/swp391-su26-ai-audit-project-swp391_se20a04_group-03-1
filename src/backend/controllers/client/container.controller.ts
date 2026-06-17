import { Request, Response } from "express";
import { Container } from "../../models/container.model";

export const containersGet = async (req: Request, res: Response) => {
  try {
    const {
      search,
      type,
      status,
      portStatus,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // TODO: get providerId from res.locals.user._id (assuming provider auth middleware sets it)
    const providerId = req.user.id;

    let query: any = { isDeleted: false, providerId };

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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
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
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể lấy danh sách container",
    });
  }
};

export const getContainerDetail = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const { id } = req.params;

    const container = await Container.findOne({
      _id: id,
      providerId,
      isDeleted: false,
    });

    if (!container) {
      return res.json({
        code: "error",
        message: "Không tìm thấy container",
      });
    }

    res.json({
      code: "success",
      data: container,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Không thể lấy thông tin container",
    });
  }
};

export const createContainerPost = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const { number, type, status, portStatus } = req.body;

    const existContainer = await Container.findOne({
      number: number.toUpperCase(),
    });
    if (existContainer) {
      if (existContainer.isDeleted) {
        return res.json({
          code: "error",
          message:
            "Mã container này đã bị xóa và đang nằm trong thùng rác. Vui lòng khôi phục lại!",
        });
      }
      return res.json({
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

    res.json({
      code: "success",
      message: "Đăng ký container thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể đăng ký container: " + (error as Error).message,
    });
  }
};

export const updateContainerPatch = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const { id, number, type, status, portStatus } = req.body;

    const existContainer = await Container.findOne({
      _id: { $ne: id },
      number: number.toUpperCase(),
    });

    if (existContainer) {
      if (existContainer.isDeleted) {
        return res.json({
          code: "error",
          message:
            "Mã container này đang nằm trong Thùng rác, không thể sử dụng để cập nhật!",
        });
      }
      return res.json({
        code: "error",
        message: "Mã container đã tồn tại trong hệ thống",
      });
    }

    const container = await Container.findOne({ _id: id, providerId });
    if (!container) {
      return res.json({
        code: "error",
        message: "Không tìm thấy container hoặc bạn không có quyền sửa",
      });
    }

    container.number = number.toUpperCase();
    container.type = type;
    container.status = status;
    if (portStatus) {
      container.portStatus = portStatus;
    }

    await container.save();

    res.json({
      code: "success",
      message: "Cập nhật container thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể cập nhật container",
    });
  }
};

export const softDeleteContainerPatch = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const { id } = req.params;

    const existContainer = await Container.findOne({ _id: id, providerId });
    if (!existContainer) {
      return res.json({
        code: "error",
        message:
          "Không tìm thấy thông tin container hoặc bạn không có quyền xóa",
      });
    }

    existContainer.isDeleted = true;
    await existContainer.save();

    res.json({
      code: "success",
      message: "Đã chuyển container vào thùng rác",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể xóa container",
    });
  }
};

export const trashContainersGet = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const {
      search,
      type,
      status,
      portStatus,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isDeleted: true, providerId };

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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
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
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể lấy danh sách container đã xóa",
    });
  }
};

export const restoreContainerPatch = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const { id } = req.params;

    const existContainer = await Container.findOne({ _id: id, providerId });
    if (!existContainer) {
      return res.json({
        code: "error",
        message:
          "Không tìm thấy thông tin container hoặc bạn không có quyền khôi phục",
      });
    }

    existContainer.isDeleted = false;
    await existContainer.save();

    res.json({
      code: "success",
      message: "Khôi phục container thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể khôi phục container",
    });
  }
};

export const hardDeleteContainerDelete = async (
  req: Request,
  res: Response,
) => {
  try {
    const providerId = req.user.id;
    const { id } = req.params;

    const existContainer = await Container.findOne({ _id: id, providerId });
    if (!existContainer) {
      return res.json({
        code: "error",
        message:
          "Không tìm thấy thông tin container hoặc bạn không có quyền xóa",
      });
    }

    await Container.deleteOne({ _id: id });

    res.json({
      code: "success",
      message: "Xóa vĩnh viễn container thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể xóa vĩnh viễn container",
    });
  }
};
