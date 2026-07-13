import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Driver } from "../../models/driver.model";
import { sendMail, buildAccountProvisionEmail } from "../../helpers/mail.helper";

const DRIVER_APP_NOTE =
  "Đăng nhập bằng ứng dụng LogiPort trên điện thoại với email này. Mật khẩu do công ty của bạn cung cấp — nếu quên, hãy liên hệ công ty để được cấp lại.";

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
      .select("-password")
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
    const { driverId, password, status } = req.body;
    const companyId = req.user.id;

    const exist = await Driver.findOne({ driverId, isDeleted: false });
    if (exist) {
      res.status(400).json({ code: "error", message: "Mã CC/GPLX tài xế đã tồn tại" });
      return;
    }

    const normEmail = req.body.email
      ? String(req.body.email).toLowerCase().trim()
      : "";

    // Email dùng làm tài khoản đăng nhập -> phải duy nhất toàn hệ thống.
    if (normEmail) {
      const existEmail = await Driver.findOne({ email: normEmail });
      if (existEmail) {
        res.status(400).json({
          code: "error",
          message: "Email này đã được dùng cho một tài khoản tài xế khác",
        });
        return;
      }
    }

    const driverData: any = {
      driverId: req.body.driverId,
      driverName: req.body.driverName,
      driverPhone: req.body.driverPhone,
      companyId,
    };

    if (normEmail) driverData.email = normEmail;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      driverData.password = await bcrypt.hash(password, salt);
    }

    // Có đủ email + mật khẩu = cấp tài khoản mobile: mặc định Active để đăng nhập
    // được ngay (trừ khi chỉ định rõ). Thiếu cặp này thì không phải tài khoản.
    const hasCredentials = Boolean(normEmail && password);
    if (hasCredentials) {
      driverData.status = status || "Active";
    } else if (status) {
      driverData.status = status;
    }

    const newDriver = new Driver(driverData);
    await newDriver.save();

    // Email cấp tài khoản (KHÔNG kèm mật khẩu). Tài xế đăng nhập bằng app.
    if (hasCredentials) {
      sendMail(
        normEmail,
        "Tài khoản tài xế LogiPort đã được khởi tạo",
        buildAccountProvisionEmail({
          name: req.body.driverName,
          codeLabel: "Mã tài xế (CCCD/GPLX)",
          code: req.body.driverId,
          email: normEmail,
          isActive: (driverData.status || "Inactive") === "Active",
          appNote: DRIVER_APP_NOTE,
        }),
      );
    }

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
    const companyId = req.user.id;

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

    const updateData: any = { ...req.body, companyId };

    // Email: chuẩn hóa + kiểm tra trùng; để rỗng = gỡ tài khoản (unset email).
    if (req.body.email !== undefined) {
      const normEmail = String(req.body.email).toLowerCase().trim();
      if (normEmail) {
        const existEmail = await Driver.findOne({
          email: normEmail,
          _id: { $ne: id },
        });
        if (existEmail) {
          res.status(400).json({
            code: "error",
            message: "Email này đã được dùng cho một tài khoản tài xế khác",
          });
          return;
        }
        updateData.email = normEmail;
      } else {
        delete updateData.email;
        updateData.$unset = { ...(updateData.$unset || {}), email: "" };
      }
    }

    // Mật khẩu: để rỗng = giữ nguyên; có nhập = băm lại.
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    } else {
      delete updateData.password;
    }

    // Ensure we only update drivers belonging to this company
    const updated = await Driver.findOneAndUpdate(
      { _id: id, companyId },
      updateData, // companyId giữ nguyên
      { new: true }
    );

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
    const { id } = req.params;
    const companyId = req.user.id;

    const data = await Driver.findOne({ _id: id, companyId }).select(
      "-password",
    );
    if (!data) {
      res.status(400).json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }

    res.status(200).json({ code: "success", data });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi lấy thông tin tài xế" });
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
      res.status(400).json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }

    res.status(200).json({ code: "success", message: "Đã đưa vào thùng rác" });
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
      .select("-password")
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
      res.status(400).json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }

    res.status(200).json({ code: "success", message: "Đã khôi phục tài xế" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi khôi phục tài xế" });
    return;
  }
};

export const hardDeleteDriverDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const deleted = await Driver.findOneAndDelete({ _id: id, companyId });

    if (!deleted) {
      res.status(400).json({ code: "error", message: "Không tìm thấy tài xế" });
      return;
    }

    res.status(200).json({ code: "success", message: "Đã xóa vĩnh viễn tài xế" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ code: "error", message: "Lỗi khi xóa vĩnh viễn" });
    return;
  }
};
