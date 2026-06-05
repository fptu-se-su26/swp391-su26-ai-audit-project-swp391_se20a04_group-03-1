import { Request, Response } from "express";
import { ContainerProvider } from "../models/container-provider.model";

export const providersGet = async (req: Request, res: Response) => {
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
        { code: searchRegex },
        { name: searchRegex },
        { contact_email: searchRegex },
        { bic_codes: searchRegex }
      ];
    }

    const totalItems = await ContainerProvider.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const providerList = await ContainerProvider.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      code: "success",
      data: providerList,
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
      message: "Không thể lấy danh sách nhà cung cấp container",
    });
  }
};

export const providerDetailGet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = await ContainerProvider.findById(id);
    if (!provider) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }
    res.json({
      code: "success",
      data: provider,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể lấy thông tin nhà cung cấp",
    });
  }
};

export const createProviderPost = async (req: Request, res: Response) => {
  try {
    const { code, contact_email } = req.body;
    const existProvider = await ContainerProvider.findOne({
      $or: [{ code: code }, { contact_email: contact_email }],
      isDeleted: false,
    });

    if (existProvider) {
      return res.json({
        code: "error",
        message: "Mã nhà cung cấp hoặc email đã tồn tại",
      });
    }

    const newProvider = new ContainerProvider(req.body);
    await newProvider.save();

    res.json({
      code: "success",
      message: "Thêm mới nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể tạo nhà cung cấp",
    });
  }
};

export const updateProviderPatch = async (req: Request, res: Response) => {
  try {
    const { id, code, contact_email } = req.body;
    const existProvider = await ContainerProvider.findOne({
      _id: { $ne: id },
      $or: [{ code: code }, { contact_email: contact_email }],
      isDeleted: false,
    });

    if (existProvider) {
      return res.json({
        code: "error",
        message: "Mã nhà cung cấp hoặc email đã tồn tại",
      });
    }

    await ContainerProvider.updateOne({ _id: id }, req.body);

    res.json({
      code: "success",
      message: "Cập nhật nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể cập nhật nhà cung cấp",
    });
  }
};

export const updateStatusPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const existProvider = await ContainerProvider.findById(id);
    if (!existProvider) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    existProvider.status = newStatus;
    await existProvider.save();

    res.json({
      code: "success",
      message: "Cập nhật trạng thái nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể cập nhật trạng thái",
    });
  }
};

export const softDeleteProviderPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existProvider = await ContainerProvider.findById(id);
    if (!existProvider) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    existProvider.isDeleted = true;
    await existProvider.save();

    res.json({
      code: "success",
      message: "Xóa nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể xóa nhà cung cấp",
    });
  }
};

export const trashProvidersGet = async (req: Request, res: Response) => {
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
        { code: searchRegex },
        { name: searchRegex },
        { contact_email: searchRegex },
        { bic_codes: searchRegex }
      ];
    }

    const totalItems = await ContainerProvider.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const providerList = await ContainerProvider.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      code: "success",
      data: providerList,
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
      message: "Không thể lấy danh sách đã xóa",
    });
  }
};

export const restoreProviderPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existProvider = await ContainerProvider.findById(id);
    if (!existProvider) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    existProvider.isDeleted = false;
    await existProvider.save();

    res.json({
      code: "success",
      message: "Khôi phục nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể khôi phục nhà cung cấp",
    });
  }
};

export const hardDeleteProviderDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existProvider = await ContainerProvider.findById(id);
    if (!existProvider) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }
    await ContainerProvider.deleteOne({ _id: id });
    res.json({
      code: "success",
      message: "Xóa vĩnh viễn nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể xóa vĩnh viễn nhà cung cấp",
    });
  }
};
