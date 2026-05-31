import { Request, Response } from "express";
import { Company } from "../models/company.model";

export const companiesGet = async (req: Request, res: Response) => {
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
        { companyCode: searchRegex },
        { companyName: searchRegex },
        { contactPhone: searchRegex },
        { email: searchRegex },
        { contactPerson: searchRegex },
      ];
    }

    const totalItems = await Company.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const companyList = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      code: "success",
      data: companyList,
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
      message: "Không thể lấy danh sách công ty",
    });
  }
};

export const companyDetailGet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin công ty",
      });
    }
    res.json({
      code: "success",
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể lấy thông tin công ty",
    });
  }
};

export const createCompanyPost = async (req: Request, res: Response) => {
  try {
    const { companyCode, email } = req.body;
    const existCompany = await Company.findOne({
      $or: [{ companyCode: companyCode }, { email: email }],
      isDeleted: false,
    });

    if (existCompany) {
      return res.json({
        code: "error",
        message: "Mã công ty hoặc email đã tồn tại",
      });
    }

    const newCompany = new Company(req.body);
    await newCompany.save();

    res.json({
      code: "success",
      message: "Thêm mới công ty thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể tạo công ty",
    });
  }
};

export const updateCompanyPatch = async (req: Request, res: Response) => {
  try {
    const { id, companyCode, email } = req.body;
    const existCompany = await Company.findOne({
      _id: { $ne: id },
      $or: [{ companyCode: companyCode }, { email: email }],
      isDeleted: false,
    });

    if (existCompany) {
      return res.json({
        code: "error",
        message: "Mã công ty hoặc email đã tồn tại",
      });
    }

    await Company.updateOne({ _id: id }, req.body);

    res.json({
      code: "success",
      message: "Cập nhật công ty thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể cập nhật công ty",
    });
  }
};

export const updateStatusPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const existCompany = await Company.findById(id);
    if (!existCompany) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin công ty",
      });
    }

    existCompany.status = newStatus;
    await existCompany.save();

    res.json({
      code: "success",
      message: "Cập nhật trạng thái công ty thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể cập nhật trạng thái công ty",
    });
  }
};

export const softDeleteCompanyPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existCompany = await Company.findById(id);
    if (!existCompany) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin công ty",
      });
    }

    existCompany.isDeleted = true;
    existCompany.deletedAt = new Date();
    await existCompany.save();

    res.json({
      code: "success",
      message: "Xóa công ty thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể xóa công ty",
    });
  }
};

export const trashCompaniesGet = async (req: Request, res: Response) => {
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
        { companyCode: searchRegex },
        { companyName: searchRegex },
        { contactPhone: searchRegex },
        { email: searchRegex },
        { contactPerson: searchRegex },
      ];
    }

    const totalItems = await Company.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const companyList = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      code: "success",
      data: companyList,
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
      message: "Không thể lấy danh sách công ty đã xóa",
    });
  }
};

export const restoreCompanyPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existCompany = await Company.findById(id);
    if (!existCompany) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin công ty",
      });
    }

    existCompany.isDeleted = false;
    existCompany.deletedAt = undefined;
    await existCompany.save();

    res.json({
      code: "success",
      message: "Khôi phục công ty thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể khôi phục công ty",
    });
  }
};

export const hardDeleteCompanyDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existCompany = await Company.findById(id);
    if (!existCompany) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin công ty",
      });
    }
    await Company.deleteOne({ _id: id });
    res.json({
      code: "success",
      message: "Xóa vĩnh viễn công ty thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể xóa vĩnh viễn công ty",
    });
  }
};
