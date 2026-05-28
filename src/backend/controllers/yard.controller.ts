import { Request, Response } from "express";
import { Yard } from "../models/yard.model";

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
    res.json({ code: "success", message: "Tạo bãi đỗ thành công", data: newYard });
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
    
    res.json({ code: "success", message: "Cập nhật cấu hình bãi đỗ thành công", data: yard });
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
