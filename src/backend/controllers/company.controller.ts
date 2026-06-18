import { Request, Response } from "express";
import { Company } from "../models/company.model";
import { Driver } from "../models/driver.model";
import { CompanyRole } from "../models/companyRole.model";
import bcrypt from "bcryptjs";
import { sendMail } from "../helpers/mail.helper";

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
    });

    if (existCompany) {
      if (existCompany.isDeleted) {
        return res.json({
          code: "error",
          message: "Mã công ty hoặc email này đang nằm trong thùng rác. Hãy khôi phục hoặc xóa vĩnh viễn trước.",
        });
      }
      return res.json({
        code: "error",
        message: "Mã công ty hoặc email đã tồn tại",
      });
    }

    const newCompany = new Company(req.body);

    if (req.body.roleCode) {
      const companyRole = await CompanyRole.findOne({ roleCode: { $regex: new RegExp(`^${req.body.roleCode}$`, 'i') } });
      if (companyRole) {
        newCompany.companyRole = companyRole._id;
      }
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      newCompany.password = await bcrypt.hash(req.body.password, salt);
    }

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
    });

    if (existCompany) {
      if (existCompany.isDeleted) {
        return res.json({
          code: "error",
          message: "Mã công ty hoặc email này đang được sử dụng bởi một công ty trong thùng rác.",
        });
      }
      return res.json({
        code: "error",
        message: "Mã công ty hoặc email đã tồn tại",
      });
    }

    const updateData = { ...req.body };
    if (updateData.roleCode) {
      const companyRole = await CompanyRole.findOne({ roleCode: { $regex: new RegExp(`^${updateData.roleCode}$`, 'i') } });
      if (companyRole) {
        updateData.companyRole = companyRole._id;
      }
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    await Company.updateOne({ _id: id }, updateData);

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

    await Company.updateOne({ _id: id }, { status: newStatus });

    if (existCompany.email) {
      const statusText = newStatus === "Active" ? "Đã Kích Hoạt" : "Đã Tạm Khóa";
      const statusColor = newStatus === "Active" ? "#1ed760" : "#f3727f";
      const statusBg = newStatus === "Active" ? "#e8fbf0" : "#fef1f2";
      const statusMessage = newStatus === "Active" 
        ? "Tuyệt vời! Tài khoản của bạn đã được Ban quản trị xác duyệt và kích hoạt thành công. Bây giờ bạn có thể đăng nhập vào hệ thống để bắt đầu điều phối container."
        : "Tài khoản của bạn hiện đang bị tạm khóa hoặc chờ duyệt. Vui lòng liên hệ với Ban quản trị LogiPort để biết thêm chi tiết và được hỗ trợ.";

      const mailTitle = `Thông báo cập nhật trạng thái tài khoản: ${statusText}`;
      const mailContent = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 40px 20px; color: #121212;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border-top: 4px solid ${statusColor};">
            <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #121212;">
              Logi<span style="color: #1ed760;">Port</span>
            </h1>
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Cập nhật trạng thái tài khoản</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #666666; margin-bottom: 24px;">
              Xin chào <b style="color: #121212;">${existCompany.contactPerson || existCompany.companyName}</b>,<br/><br/>
              Hệ thống điều phối logistics thông minh <strong>LogiPort</strong> xin thông báo về việc thay đổi trạng thái tài khoản doanh nghiệp của bạn.
            </p>
            
            <div style="background-color: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
              <p style="margin: 0; font-size: 15px; color: ${statusColor}; font-weight: 700;">
                Trạng thái hiện tại: ${statusText}
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
                ${statusMessage}
              </p>
            </div>

            <div style="background-color: #f8f8f8; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #121212;">Thông tin tài khoản</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666; width: 40%;">Mã doanh nghiệp</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${existCompany.companyCode}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666;">Tên doanh nghiệp</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${existCompany.companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #666666;">Email liên hệ</td>
                  <td style="padding: 8px 0; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${existCompany.email}</td>
                </tr>
              </table>
            </div>

            ${newStatus === "Active" ? `<a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/client/company/login" style="display: inline-block; background-color: #1ed760; color: #121212; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 500px; text-transform: uppercase; letter-spacing: 1.5px; font-size: 14px; margin-bottom: 32px;">Đăng nhập ngay</a>` : ''}

            <div style="border-top: 1px solid #e5e5e5; padding-top: 24px;">
              <p style="margin: 0; font-size: 14px; color: #999999; font-weight: 700;">Trân trọng,</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #121212; font-weight: 900;">Đội ngũ LogiPort</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <p style="font-size: 12px; color: #999999; line-height: 1.5;">
              Đây là email tự động từ hệ thống LogiPort. Vui lòng không trả lời email này.<br/>
              © ${new Date().getFullYear()} LogiPort. All rights reserved.
            </p>
          </div>
        </div>
      `;
      sendMail(existCompany.email, mailTitle, mailContent);
    }

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

    await Company.updateOne({ _id: id }, { isDeleted: true, deletedAt: new Date() });

    // Cascade soft delete all drivers belonging to this company
    await Driver.updateMany({ companyId: id }, { isDeleted: true });

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

    await Company.updateOne(
      { _id: id },
      { $set: { isDeleted: false }, $unset: { deletedAt: "" } }
    );

    // Cascade restore all drivers belonging to this company
    await Driver.updateMany({ companyId: id }, { isDeleted: false });

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
    
    // Cascade hard delete all drivers belonging to this company
    await Driver.deleteMany({ companyId: id });
    
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
