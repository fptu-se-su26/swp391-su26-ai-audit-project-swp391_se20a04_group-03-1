import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const containerPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    number: Joi.string().required().messages({
      "string.empty": "Mã container là bắt buộc.",
      "any.required": "Mã container là bắt buộc.",
    }),
    type: Joi.string().required().messages({
      "string.empty": "Loại container là bắt buộc.",
      "any.required": "Loại container là bắt buộc.",
    }),
    status: Joi.string().valid("Hàng", "Rỗng").required().messages({
      "string.empty": "Tình trạng là bắt buộc.",
      "any.required": "Tình trạng là bắt buộc.",
      "any.only": "Tình trạng phải là Hàng hoặc Rỗng.",
    }),
    portStatus: Joi.string().valid("Chưa nhập cảng", "Đã nhập cảng", "Đang lưu bãi", "Đã xuất cảng").optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.json({
      code: "error",
      message: error.details[0].message,
    });
    return;
  }
  next();
};

export const containerEdit = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    id: Joi.string().required().messages({
      "string.empty": "ID container là bắt buộc.",
      "any.required": "ID container là bắt buộc.",
    }),
    number: Joi.string().required().messages({
      "string.empty": "Mã container là bắt buộc.",
      "any.required": "Mã container là bắt buộc.",
    }),
    type: Joi.string().required().messages({
      "string.empty": "Loại container là bắt buộc.",
      "any.required": "Loại container là bắt buộc.",
    }),
    status: Joi.string().valid("Hàng", "Rỗng").required().messages({
      "string.empty": "Tình trạng là bắt buộc.",
      "any.required": "Tình trạng là bắt buộc.",
      "any.only": "Tình trạng phải là Hàng hoặc Rỗng.",
    }),
    portStatus: Joi.string().valid("Chưa nhập cảng", "Đã nhập cảng", "Đang lưu bãi", "Đã xuất cảng").optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.json({
      code: "error",
      message: error.details[0].message,
    });
    return;
  }
  next();
};
