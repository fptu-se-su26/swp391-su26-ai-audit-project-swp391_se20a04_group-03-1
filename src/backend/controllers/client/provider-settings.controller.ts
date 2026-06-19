import { Request, Response } from "express";
import { ContainerProvider } from "../../models/container-provider.model";

export const getSettings = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const provider = await ContainerProvider.findById(providerId).select("bic_codes code name contact_email");

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
    console.error(error);
    res.json({
      code: "error",
      message: "Lỗi khi lấy cài đặt",
    });
  }
};

export const updateBicCodes = async (req: Request, res: Response) => {
  try {
    const providerId = req.user.id;
    const { bic_codes } = req.body;

    if (!Array.isArray(bic_codes)) {
      return res.json({
        code: "error",
        message: "Định dạng mã BIC không hợp lệ",
      });
    }

    // Convert to uppercase and filter empty
    const validBicCodes = bic_codes
      .map((code) => code.toString().trim().toUpperCase())
      .filter((code) => code.length > 0);

    const provider = await ContainerProvider.findByIdAndUpdate(
      providerId,
      { bic_codes: validBicCodes },
      { new: true }
    ).select("bic_codes");

    if (!provider) {
      return res.json({
        code: "error",
        message: "Không tìm thấy thông tin nhà cung cấp",
      });
    }

    res.json({
      code: "success",
      message: "Cập nhật mã BIC thành công",
      data: provider.bic_codes,
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: "error",
      message: "Lỗi khi cập nhật mã BIC",
    });
  }
};
