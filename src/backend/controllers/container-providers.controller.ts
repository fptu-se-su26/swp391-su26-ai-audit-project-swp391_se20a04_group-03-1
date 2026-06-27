import { Request, Response } from "express";
import { ContainerProvider } from "../models/container-provider.model";
import bcrypt from "bcryptjs";
import { sendMail } from "../helpers/mail.helper";

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

    res.status(200).json({
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
    res.status(400).json({
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
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }
    res.status(200).json({
      code: "success",
      data: provider,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể lấy thông tin nhà cung cấp",
    });
  }
};

export const createProviderPost = async (req: Request, res: Response) => {
  try {
    const { code, contact_email } = req.body;
    const existProvider = await ContainerProvider.findOne({
      $or: [{ code: code }, { contact_email: contact_email }]
    });

    if (existProvider) {
      if (existProvider.isDeleted) {
        return res.status(400).json({
          code: "error",
          message: "Mã nhà cung cấp hoặc email này đang nằm trong Thùng rác. Vui lòng vào Thùng rác để khôi phục hoặc xóa vĩnh viễn trước khi tạo lại!",
        });
      }
      return res.status(400).json({
        code: "error",
        message: "Mã nhà cung cấp hoặc email đã tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const providerData = { ...req.body, password: hashedPassword };
    const newProvider = new ContainerProvider(providerData);
    await newProvider.save();

    res.status(200).json({
      code: "success",
      message: "Thêm mới nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể tạo nhà cung cấp: " + (error as Error).message,
    });
  }
};

export const updateProviderPatch = async (req: Request, res: Response) => {
  try {
    const { id, code, contact_email } = req.body;
    const existProvider = await ContainerProvider.findOne({
      _id: { $ne: id },
      $or: [{ code: code }, { contact_email: contact_email }]
    });

    if (existProvider) {
      if (existProvider.isDeleted) {
        return res.status(400).json({
          code: "error",
          message: "Mã nhà cung cấp hoặc email này đang nằm trong Thùng rác, không thể sử dụng để cập nhật!",
        });
      }
      return res.status(400).json({
        code: "error",
        message: "Mã nhà cung cấp hoặc email đã tồn tại",
      });
    }

    const updateData = { ...req.body };
    if (updateData.password && updateData.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    await ContainerProvider.updateOne({ _id: id }, updateData);

    res.status(200).json({
      code: "success",
      message: "Cập nhật nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
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
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    existProvider.status = newStatus;
    await existProvider.save();

    if (existProvider.contact_email) {
      const statusText = newStatus === "ACTIVE" ? "Đã Kích Hoạt" : "Đã Tạm Khóa";
      const statusColor = newStatus === "ACTIVE" ? "#1ed760" : "#f3727f";
      const statusBg = newStatus === "ACTIVE" ? "#e8fbf0" : "#fef1f2";
      const statusMessage = newStatus === "ACTIVE" 
        ? "Tuyệt vời! Tài khoản của bạn đã được Ban quản trị xác duyệt và kích hoạt thành công. Bây giờ bạn có thể đăng nhập vào hệ thống để bắt đầu điều phối."
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
              Xin chào <b style="color: #121212;">${existProvider.name}</b>,<br/><br/>
              Hệ thống điều phối logistics thông minh <strong>LogiPort</strong> xin thông báo về việc thay đổi trạng thái tài khoản nhà cung cấp của bạn.
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
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666; width: 40%;">Mã nhà cung cấp</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${existProvider.code}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #666666;">Tên nhà cung cấp</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${existProvider.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #666666;">Email liên hệ</td>
                  <td style="padding: 8px 0; font-size: 15px; font-weight: 700; color: #121212; text-align: right;">${existProvider.contact_email}</td>
                </tr>
              </table>
            </div>

            ${newStatus === "ACTIVE" ? `<a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/client/provider/login" style="display: inline-block; background-color: #1ed760; color: #121212; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 500px; text-transform: uppercase; letter-spacing: 1.5px; font-size: 14px; margin-bottom: 32px;">Đăng nhập ngay</a>` : ''}

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
      sendMail(existProvider.contact_email, mailTitle, mailContent);
    }

    res.status(200).json({
      code: "success",
      message: "Cập nhật trạng thái nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
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
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    existProvider.isDeleted = true;
    await existProvider.save();

    res.status(200).json({
      code: "success",
      message: "Xóa nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
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

    res.status(200).json({
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
    res.status(400).json({
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
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    existProvider.isDeleted = false;
    await existProvider.save();

    res.status(200).json({
      code: "success",
      message: "Khôi phục nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
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
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }
    await ContainerProvider.deleteOne({ _id: id });
    res.status(200).json({
      code: "success",
      message: "Xóa vĩnh viễn nhà cung cấp thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Không thể xóa vĩnh viễn nhà cung cấp",
    });
  }
};
