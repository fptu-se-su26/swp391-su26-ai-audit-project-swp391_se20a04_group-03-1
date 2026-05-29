import { Request, Response } from "express";
import { Yard } from "../models/yard.model";
import { io } from "../index";
import cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";

export const yardsGet = async (req: Request, res: Response) => {
  try {
    const yards = await Yard.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ code: "success", data: yards });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi lấy danh sách bãi đỗ" });
  }
};

export const createYardPost = async (req: Request, res: Response) => {
  try {
    const { name, cameraIp } = req.body;
    const newYard = new Yard({ name, cameraIp });
    await newYard.save();
    res.json({
      code: "success",
      message: "Tạo bãi đỗ thành công",
      data: newYard,
    });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi tạo bãi đỗ" });
  }
};

export const yardDetailGet = async (req: Request, res: Response) => {
  try {
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.json({ code: "error", message: "Không tìm thấy bãi đỗ" });
    }
    res.json({ code: "success", data: yard });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi lấy thông tin bãi đỗ" });
  }
};

export const updateYardSlotsPatch = async (req: Request, res: Response) => {
  try {
    const { slots } = req.body;
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.json({ code: "error", message: "Không tìm thấy bãi đỗ" });
    }

    yard.slots = slots;
    await yard.save();

    res.json({
      code: "success",
      message: "Cập nhật cấu hình bãi đỗ thành công",
      data: yard,
    });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi cấu hình bãi đỗ" });
  }
};

export const deleteYardDelete = async (req: Request, res: Response) => {
  try {
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.json({ code: "error", message: "Không tìm thấy bãi đỗ" });
    }

    yard.isDeleted = true;
    await yard.save();

    res.json({ code: "success", message: "Xóa bãi đỗ thành công" });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi xóa bãi đỗ" });
  }
};

export const syncYardDataPost = async (req: Request, res: Response) => {
  try {
    const yard_id = req.params.id;
    const { occupied_slots } = req.body;

    if (!occupied_slots || !Array.isArray(occupied_slots)) {
      return res.json({
        code: "error",
        message: "Sai dữ liệu đầu vào",
      });
    }

    io.to(yard_id).emit("yard_status_updated", {
      yard_id: yard_id,
      occupied_slots: occupied_slots,
      timestamp: new Date().toISOString(),
    });

    res.json({
      code: "success",
      message: "Đã gửi dữ liệu bãi đỗ thành công",
    });
  } catch (error) {
    console.log("Lỗi đồng bộ dữ liệu bãi đỗ:", error);
    res.json({ code: "error", message: "Lỗi đồng bộ dữ liệu bãi đỗ" });
  }
};

export const updateYardInfoPatch = async (req: Request, res: Response) => {
  try {
    const { name, cameraIp } = req.body;
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.json({ code: "error", message: "Không tìm thấy bãi đỗ" });
    }

    yard.name = name;
    yard.cameraIp = cameraIp;
    await yard.save();

    res.json({
      code: "success",
      message: "Cập nhật thông tin bãi đỗ thành công",
      data: yard,
    });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi cập nhật thông tin bãi đỗ" });
  }
};

export const takeYardSnapshotPost = async (req: Request, res: Response) => {
  try {
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.json({ code: "error", message: "Không tìm thấy bãi đỗ" });
    }

    // 1. Fetch snapshot from AI server
    const aiResponse = await fetch(`http://127.0.0.1:5001/snapshot?rtsp_url=${encodeURIComponent(yard.cameraIp)}`);
    if (!aiResponse.ok) {
       return res.json({ code: "error", message: "Không thể lấy ảnh từ luồng Camera" });
    }

    const arrayBuffer = await aiResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload to Cloudinary using streamifier
    const uploadToCloudinary = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ai_audit_snapshots" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    // 3. Update yard DB
    yard.snapshotUrl = cloudinaryResult.secure_url;
    await yard.save();

    res.json({
      code: "success",
      message: "Chụp và lưu ảnh thành công",
      data: { snapshotUrl: yard.snapshotUrl }
    });
  } catch (error) {
    console.error("Lỗi snapshot:", error);
    res.json({ code: "error", message: "Lỗi hệ thống khi chụp ảnh" });
  }
};
