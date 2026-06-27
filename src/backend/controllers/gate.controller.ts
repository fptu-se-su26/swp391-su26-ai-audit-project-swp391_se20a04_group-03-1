import { Request, Response } from "express";
import { Gate } from "../models/gate.model";
import { Yard } from "../models/yard.model";

export const gatesGet = async (req: Request, res: Response) => {
  try {
    const gates = await Gate.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({ code: "success", data: gates });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi lấy danh sách cổng" });
    return;
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
      return res.status(400).json({ code: "error", message: "Camera IP đã tồn tại" });
      return;
    }
    const otherExistCamera = await Yard.findOne({
      cameraIp: cameraIp,
      isDeleted: false,
    });
    if (otherExistCamera) {
      return res.status(400).json({ code: "error", message: "Camera IP đã tồn tại ở bãi" });
      return;
    }
    const newGate = new Gate({ name, cameraIp, type });
    await newGate.save();
    res.status(200).json({
      code: "success",
      message: "Tạo cổng thành công",
      data: newGate,
    });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi tạo cổng" });
    return;
  }
};

export const gateDetailGet = async (req: Request, res: Response) => {
  try {
    const gate = await Gate.findById(req.params.id);
    if (!gate) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy cổng" });
      return;
    }
    res.status(200).json({ code: "success", data: gate });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi lấy thông tin cổng" });
    return;
  }
};

export const deleteGateDelete = async (req: Request, res: Response) => {
  try {
    const gate = await Gate.findById(req.params.id);
    if (!gate) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy cổng" });
      return;
    }

    gate.isDeleted = true;
    await gate.save();

    res.status(200).json({ code: "success", message: "Xóa cổng thành công" });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi xóa cổng" });
    return;
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
      return res.status(400).json({ code: "error", message: "Camera IP đã tồn tại ở bãi" });
      return;
    }
    const existGate = await Gate.findOne({
      cameraIp: cameraIp,
      _id: { $ne: req.params.id },
      isDeleted: false,
    });
    if (existGate) {
      return res.status(400).json({
        code: "error",
        message: "Camera IP đã tồn tại ở cổng khác",
      });
      return;
    }
    await Gate.updateOne(
      { _id: req.params.id },
      { name: name, cameraIp: cameraIp, type: type },
    );

    res.status(200).json({
      code: "success",
      message: "Cập nhật thông tin cổng thành công",
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: "error", message: "Lỗi cập nhật thông tin cổng" });
    return;
  }
};

export const gatesTrashGet = async (req: Request, res: Response) => {
  try {
    const gates = await Gate.find({ isDeleted: true }).sort({ createdAt: -1 });
    res.status(200).json({ code: "success", data: gates });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi lấy danh sách cổng đã xóa" });
    return;
  }
};

export const restoreGatePatch = async (req: Request, res: Response) => {
  try {
    const gate = await Gate.findById(req.params.id);
    if (!gate) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy cổng" });
      return;
    }
    gate.isDeleted = false;
    await gate.save();
    res.status(200).json({ code: "success", message: "Khôi phục cổng thành công" });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi khôi phục cổng" });
    return;
  }
};

export const hardDeleteGateDelete = async (req: Request, res: Response) => {
  try {
    const result = await Gate.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy cổng" });
      return;
    }
    res.status(200).json({ code: "success", message: "Xóa vĩnh viễn cổng thành công" });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi xóa vĩnh viễn cổng" });
    return;
  }
};
