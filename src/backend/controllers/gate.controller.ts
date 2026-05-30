import { Request, Response } from "express";
import { Gate } from "../models/gate.model";
import { Yard } from "../models/yard.model";

export const gatesGet = async (req: Request, res: Response) => {
  try {
    const gates = await Gate.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ code: "success", data: gates });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi lấy danh sách cổng" });
  }
};

export const createGatePost = async (req: Request, res: Response) => {
  try {
    const { name, cameraIp, type } = req.body;
    const existGate = await Gate.findOne({
      cameraIp: cameraIp,
      isDeleted: false,
    });
    if (existGate) {
      return res.json({ code: "error", message: "Camera IP đã tồn tại" });
    }
    const otherExistCamera = await Yard.findOne({
      cameraIp: cameraIp,
      isDeleted: false,
    });
    if (otherExistCamera) {
      return res.json({ code: "error", message: "Camera IP đã tồn tại ở bãi" });
    }
    const newGate = new Gate({ name, cameraIp, type });
    await newGate.save();
    res.json({
      code: "success",
      message: "Tạo cổng thành công",
      data: newGate,
    });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi tạo cổng" });
  }
};

export const gateDetailGet = async (req: Request, res: Response) => {
  try {
    const gate = await Gate.findById(req.params.id);
    if (!gate) {
      return res.json({ code: "error", message: "Không tìm thấy cổng" });
    }
    res.json({ code: "success", data: gate });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi lấy thông tin cổng" });
  }
};

export const deleteGateDelete = async (req: Request, res: Response) => {
  try {
    const gate = await Gate.findById(req.params.id);
    if (!gate) {
      return res.json({ code: "error", message: "Không tìm thấy cổng" });
    }

    gate.isDeleted = true;
    await gate.save();

    res.json({ code: "success", message: "Xóa cổng thành công" });
  } catch (error) {
    res.json({ code: "error", message: "Lỗi xóa cổng" });
  }
};

export const updateGateInfoPatch = async (req: Request, res: Response) => {
  try {
    const { name, cameraIp, type } = req.body;
    const otherExistCamera = await Yard.findOne({
      cameraIp: cameraIp,
      isDeleted: false,
    });
    if (otherExistCamera) {
      return res.json({ code: "error", message: "Camera IP đã tồn tại ở bãi" });
    }
    const existGate = await Gate.findOne({
      cameraIp: cameraIp,
      _id: { $ne: req.params.id },
      isDeleted: false,
    });
    if (existGate) {
      return res.json({
        code: "error",
        message: "Camera IP đã tồn tại ở cổng khác",
      });
    }
    await Gate.updateOne(
      { _id: req.params.id },
      { name: name, cameraIp: cameraIp, type: type },
    );

    res.json({
      code: "success",
      message: "Cập nhật thông tin cổng thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", message: "Lỗi cập nhật thông tin cổng" });
  }
};
