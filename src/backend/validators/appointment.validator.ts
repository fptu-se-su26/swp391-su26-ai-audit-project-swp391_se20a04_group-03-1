import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const appointmentPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    truckPlate: Joi.string()
      .required()
      .regex(/^[0-9]{2}[A-Z][A-Z0-9]?[0-9]{4,5}$/)
      .messages({
        "string.empty": "Biển số xe là bắt buộc.",
        "any.required": "Biển số xe là bắt buộc.",
        "string.pattern.base": "Định dạng sai (VD: 15C12345 hoặc 29H112345).",
        "string.pattern": "Định dạng sai (VD: 15C12345 hoặc 29H112345).",
      }),
        driverId: Joi.string().required().messages({
      "string.empty": "Tài xế là bắt buộc.",
      "any.required": "Tài xế là bắt buộc.",
    }),
    containerNo: Joi.string()
      .required()
      .regex(/^[A-Z]{4}[0-9]{7}$/i)
      .messages({
        "string.empty": "Mã container là bắt buộc.",
        "any.required": "Mã container là bắt buộc.",
        "string.pattern":
          "Mã container không đúng chuẩn ISO 6346 (VD: MSCU1234567).",
      }),
    scheduledDate: Joi.date().required().messages({
      "date.empty": "Ngày hẹn là bắt buộc.",
      "date.base": "Ngày hẹn không hợp lệ.",
    }),
    timeSlot: Joi.string().required().messages({
      "string.empty": "Khung giờ là bắt buộc.",
      "any.required": "Khung giờ là bắt buộc.",
    }),
    purpose: Joi.string()
      .required()
      .valid("Lấy container", "Trả container")
      .messages({
        "string.empty": "Mục đích là bắt buộc.",
        "any.required": "Mục đích là bắt buộc.",
        "any.only": "Mục đích chỉ được là Lấy container hoặc Trả container.",
      }),
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

export const appointmentEdit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    id: Joi.string().required().messages({
      "string.empty": "ID lịch hẹn là bắt buộc.",
      "any.required": "ID lịch hẹn là bắt buộc.",
    }),
    truckPlate: Joi.string()
      .required()
      .regex(/^[0-9]{2}[A-Z][A-Z0-9]?[0-9]{4,5}$/)
      .messages({
        "string.empty": "Biển số xe là bắt buộc.",
        "any.required": "Biển số xe là bắt buộc.",
        "string.pattern.base": "Định dạng sai (VD: 15C12345 hoặc 29H112345).",
        "string.pattern": "Định dạng sai (VD: 15C12345 hoặc 29H112345).",
      }),
        driverId: Joi.string().required().messages({
      "string.empty": "Tài xế là bắt buộc.",
      "any.required": "Tài xế là bắt buộc.",
    }),
    containerNo: Joi.string()
      .required()
      .regex(/^[A-Z]{4}[0-9]{7}$/i)
      .messages({
        "string.empty": "Mã container là bắt buộc.",
        "any.required": "Mã container là bắt buộc.",
        "string.pattern":
          "Mã container không đúng chuẩn ISO 6346 (VD: MSCU1234567).",
      }),
    scheduledDate: Joi.date().required().messages({
      "date.empty": "Ngày hẹn là bắt buộc.",
      "date.base": "Ngày hẹn không hợp lệ.",
    }),
    timeSlot: Joi.string().required().messages({
      "string.empty": "Khung giờ là bắt buộc.",
      "any.required": "Khung giờ là bắt buộc.",
    }),
    purpose: Joi.string()
      .required()
      .valid("Lấy container", "Trả container")
      .messages({
        "string.empty": "Mục đích là bắt buộc.",
        "any.required": "Mục đích là bắt buộc.",
        "any.only": "Mục đích chỉ được là Lấy container hoặc Trả container.",
      }),
    status: Joi.string().optional(),
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
