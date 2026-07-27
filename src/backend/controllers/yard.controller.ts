import { Request, Response } from "express";
import { Yard } from "../models/yard.model";
import { io } from "../index";
import cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";
import { Gate } from "../models/gate.model";
import { GateTransaction } from "../models/gateTransaction.model";
import { speakGateAlert } from "../services/gate-announce.service";
import { notify } from "../services/notification.service";

/** Chuẩn hoá mã container: bỏ ký tự lạ, viết hoa. */
const normContainer = (s?: string): string =>
  (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

/**
 * So khớp mã container trên ĐÚNG 4 chữ + 6 số ĐẦU (10 ký tự). OCR KHÔNG đọc được số kiểm
 * tra thứ 7 (ký tự thứ 11) nên ta BỎ HẲN nó ở cả hai phía: DB lưu 11 ký tự, CV trả 10 ký tự
 * — cắt cùng về 10 rồi so bằng nhau (chính xác hơn so-tiền-tố, tránh khớp nhầm).
 * Dữ liệu ngắn hơn 10 thì so theo tiền tố phần chung.
 */
const containerMatches = (a?: string, b?: string): boolean => {
  const x = normContainer(a);
  const y = normContainer(b);
  if (!x || !y) return false;
  const n = Math.min(x.length, y.length, 10);
  return x.slice(0, n) === y.slice(0, n);
};

export const yardsGet = async (req: Request, res: Response) => {
  try {
    const yards = await Yard.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({ code: "success", data: yards });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi lấy danh sách bãi đỗ" });
    return;
  }
};

export const createYardPost = async (req: Request, res: Response) => {
  try {
    const { name, cameraIp } = req.body;
    const existYard = await Yard.findOne({
      cameraIp: cameraIp,
      isDeleted: false,
    });
    if (existYard) {
      return res.status(400).json({ code: "error", message: "Camera IP đã tồn tại" });
      return;
    }
    const otherExistCamera = await Gate.findOne({
      cameraIp: cameraIp,
      isDeleted: false,
    });
    if (otherExistCamera) {
      return res.status(400).json({
        code: "error",
        message: "Camera IP đã tồn tại ở cổng",
      });
      return;
    }
    const newYard = new Yard({ name, cameraIp });
    await newYard.save();
    res.status(200).json({
      code: "success",
      message: "Tạo bãi đỗ thành công",
      data: newYard,
    });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi tạo bãi đỗ" });
    return;
  }
};

export const yardDetailGet = async (req: Request, res: Response) => {
  try {
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy bãi đỗ" });
      return;
    }
    res.status(200).json({ code: "success", data: yard });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi lấy thông tin bãi đỗ" });
    return;
  }
};

export const updateYardSlotsPatch = async (req: Request, res: Response) => {
  try {
    const { slots } = req.body;
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy bãi đỗ" });
      return;
    }

    yard.slots = slots;
    await yard.save();

    res.status(200).json({
      code: "success",
      message: "Cập nhật cấu hình bãi đỗ thành công",
      data: yard,
    });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi cấu hình bãi đỗ" });
    return;
  }
};

export const deleteYardDelete = async (req: Request, res: Response) => {
  try {
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy bãi đỗ" });
      return;
    }

    yard.isDeleted = true;
    await yard.save();

    res.status(200).json({ code: "success", message: "Xóa bãi đỗ thành công" });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi xóa bãi đỗ" });
    return;
  }
};

export const syncYardDataPost = async (req: Request, res: Response) => {
  try {
    const yard_id = req.params.id;
    const { occupied_slots } = req.body;

    if (!occupied_slots || !Array.isArray(occupied_slots)) {
      return res.status(400).json({
        code: "error",
        message: "Sai dữ liệu đầu vào",
      });
      return;
    }

    // Chuẩn hoá về mảng chuỗi ô hợp lệ trước khi lưu.
    const occupiedList: string[] = occupied_slots
      .map((s: unknown) => String(s))
      .filter((s: string) => s.length > 0);
    const now = new Date();

    // LƯU LẠI trạng thái chiếm ô vào DB để reload trang không mất dữ liệu.
    // CV chỉ gọi khi tập ô thay đổi nên mỗi lần ghi là một thay đổi thật —
    // không cần hẹn giờ 5s hay chống dội thêm. Không chặn luồng nếu ghi lỗi.
    try {
      await Yard.updateOne(
        { _id: yard_id },
        { liveOccupiedSlots: occupiedList, liveOccupancyAt: now },
      );
    } catch (err) {
      console.error("Lỗi lưu trạng thái chiếm ô của bãi:", err);
    }

    io.to(yard_id).emit("yard_status_updated", {
      yard_id: yard_id,
      occupied_slots: occupiedList,
      timestamp: now.toISOString(),
    });

    res.status(200).json({
      code: "success",
      message: "Đã gửi dữ liệu bãi đỗ thành công",
    });
    return;
  } catch (error) {
    console.log("Lỗi đồng bộ dữ liệu bãi đỗ:", error);
    res.status(400).json({ code: "error", message: "Lỗi đồng bộ dữ liệu bãi đỗ" });
    return;
  }
};

/**
 * Kiểm tra một container mà CAMERA BÃI đọc được có ĐÚNG ô của nó không.
 *
 * CV (yard_capture_worker) OCR mã container ở bãi, xác định nó nằm ở ô nào (theo hình học
 * slot) rồi POST `{ slotName, containerNo }` vào đây. Backend đối chiếu với ô mà hệ thống
 * đã CẤP cho container đó lúc check-in (GateTransaction status "in": yardId + assignedSlot +
 * actualContainerNo). Nếu sai vị trí → PHÁT LOA CỔNG IN + emit socket cho dashboard.
 *
 * Ba tình huống báo lỗi (đều bật):
 *  1. wrong_container   — ô này đã cấp cho container khác, nhưng camera thấy container này.
 *  2. misplaced_in_empty— ô hệ thống coi là TRỐNG nhưng lại có container (đỗ chui/sai chỗ).
 *  3. unknown_container — mã đọc được không khớp bất kỳ xe nào đang trong bãi (container lạ).
 * Với (1)(2), nếu tra được container này ĐÁNG LẼ ở ô nào thì đọc kèm hướng dẫn đúng ô.
 *
 * Route nội bộ (x-internal-secret) — CV gọi, không phải người dùng.
 */
export const verifyYardSlotPost = async (req: Request, res: Response) => {
  try {
    const yardId = req.params.id;
    const { slotName, containerNo } = req.body;

    if (!slotName || !containerNo) {
      return res.status(400).json({ code: "error", message: "Thiếu slotName hoặc containerNo" });
    }

    const yard = await Yard.findById(yardId).select("name slots isDeleted");
    if (!yard || yard.isDeleted) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy bãi đỗ" });
    }
    const slotExists = (yard.slots || []).some((s) => s.slotName === slotName);
    if (!slotExists) {
      return res.status(400).json({ code: "error", message: "Ô không tồn tại trong bãi" });
    }

    const detected = String(containerNo).trim().toUpperCase();

    // Tất cả xe đang trong bãi — dùng để tra "ô này của container nào" và "container này ở ô nào".
    const actives = await GateTransaction.find({ status: "in", isDeleted: false })
      .select("actualContainerNo assignedSlot yardId");

    const expectedTx = actives.find(
      (t) => t.yardId?.toString() === yardId && t.assignedSlot === slotName,
    );
    // Container này ĐÁNG LẼ đỗ ở ô nào (tra theo mã, bất kể bãi nào).
    const correctTx = actives.find((t) => containerMatches(t.actualContainerNo, detected));

    // ĐÚNG: ô có xe giữ và mã container khớp → không báo.
    if (expectedTx && containerMatches(expectedTx.actualContainerNo, detected)) {
      io.emit("yard_slot_verified", {
        yardId,
        slotName,
        containerNo: detected,
        ok: true,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json({ code: "success", status: "match" });
    }

    // Tra ô đúng của container (nếu có) để đọc kèm hướng dẫn.
    let correctSlotName: string | null = null;
    let correctYardName: string | null = null;
    if (correctTx) {
      correctSlotName = correctTx.assignedSlot || null;
      if (correctTx.yardId) {
        const cy = await Yard.findById(correctTx.yardId).select("name");
        correctYardName = cy?.name || null;
      }
    }

    let alertType: string;
    let message: string;
    const guide = correctSlotName
      ? ` Container này phải đỗ ở ô ${correctSlotName}${correctYardName ? `, bãi ${correctYardName}` : ""}.`
      : "";

    if (expectedTx) {
      // (1) ô đã cấp cho container khác
      alertType = "wrong_container";
      message = correctSlotName
        ? `Phát hiện container sai vị trí tại ô ${slotName}.${guide} Vui lòng kiểm tra.`
        : `Phát hiện container lạ tại ô ${slotName}, không đúng xe được cấp ô này. Vui lòng kiểm tra.`;
    } else if (correctSlotName) {
      // (2) ô hệ thống coi là trống nhưng có container ĐÃ biết nơi đúng
      alertType = "misplaced_in_empty";
      message = `Phát hiện container đỗ sai ở ô ${slotName}.${guide} Vui lòng kiểm tra.`;
    } else {
      // (3) container lạ, không khớp xe nào trong bãi
      alertType = "unknown_container";
      message = `Phát hiện container lạ tại ô ${slotName} không có trong hệ thống. Vui lòng kiểm tra.`;
    }

    // Phát loa cổng IN, debounce theo (bãi + ô + mã) để không lải nhải khi container đứng yên.
    speakGateAlert("in", `yard:${yardId}:${slotName}:${detected}`, message);

    // Container đỗ sai ô là sự cố cần người xử lý — đưa vào chuông thông báo.
    void notify({
      type: "yard",
      severity: "error",
      title: "Container sai vị trí trong bãi",
      message,
      link: `/admin/yard/${yardId}`,
      dedupeKey: `yard-mismatch:${yardId}:${slotName}:${detected}`,
    });

    io.emit("yard_slot_mismatch", {
      yardId,
      slotName,
      detected,
      alertType,
      correctSlotName,
      correctYardName,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      code: "success",
      status: alertType,
      detected,
      correctSlot: correctSlotName,
    });
  } catch (error) {
    console.error("Lỗi kiểm tra ô bãi:", error);
    return res.status(400).json({ code: "error", message: "Lỗi kiểm tra ô bãi" });
  }
};

export const updateYardInfoPatch = async (req: Request, res: Response) => {
  try {
    const { name, cameraIp } = req.body;
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy bãi đỗ" });
      return;
    }
    const otherExistCamera = await Gate.findOne({ cameraIp: cameraIp });
    if (otherExistCamera) {
      return res.status(400).json({
        code: "error",
        message: "Camera IP đã tồn tại ở cổng",
      });
      return;
    }

    yard.name = name;
    yard.cameraIp = cameraIp;
    await yard.save();

    res.status(200).json({
      code: "success",
      message: "Cập nhật thông tin bãi đỗ thành công",
      data: yard,
    });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi cập nhật cấu trúc bãi" });
    return;
  }
};

export const yardsTrashGet = async (req: Request, res: Response) => {
  try {
    const yards = await Yard.find({ isDeleted: true }).sort({ createdAt: -1 });
    res.status(200).json({ code: "success", data: yards });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi lấy danh sách bãi đỗ đã xóa" });
    return;
  }
};

export const restoreYardPatch = async (req: Request, res: Response) => {
  try {
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy bãi đỗ" });
      return;
    }
    yard.isDeleted = false;
    await yard.save();
    res.status(200).json({ code: "success", message: "Khôi phục bãi đỗ thành công" });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi khôi phục bãi đỗ" });
    return;
  }
};

export const hardDeleteYardDelete = async (req: Request, res: Response) => {
  try {
    const result = await Yard.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy bãi đỗ" });
      return;
    }
    res.status(200).json({ code: "success", message: "Xóa vĩnh viễn bãi đỗ thành công" });
    return;
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi xóa vĩnh viễn bãi đỗ" });
    return;
  }
};

export const takeYardSnapshotPost = async (req: Request, res: Response) => {
  try {
    const yard = await Yard.findById(req.params.id);
    if (!yard) {
      return res.status(400).json({ code: "error", message: "Không tìm thấy bãi đỗ" });
      return;
    }

    // 1. Fetch snapshot from AI server
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:5001";
    const aiResponse = await fetch(
      `${pythonApiUrl}/snapshot?rtsp_url=${encodeURIComponent(yard.cameraIp)}`,
    );
    if (!aiResponse.ok) {
      return res.status(400).json({
        code: "error",
        message: "Không thể lấy ảnh từ luồng Camera",
      });
      return;
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
          },
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    // 3. Update yard DB
    yard.snapshotUrl = cloudinaryResult.secure_url;
    await yard.save();

    res.status(200).json({
      code: "success",
      message: "Chụp và lưu ảnh thành công",
      data: { snapshotUrl: yard.snapshotUrl },
    });
    return;
  } catch (error) {
    console.error("Lỗi snapshot:", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi chụp ảnh" });
    return;
  }
};
