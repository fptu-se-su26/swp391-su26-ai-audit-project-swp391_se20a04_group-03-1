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
      .regex(/^([0-9]{2})([A-Z]{1})([0-9]{5})$/)
      .messages({
        "string.empty": "Biển số xe là bắt buộc.",
        "any.required": "Biển số xe là bắt buộc.",
        "string.pattern": "Định dạng biển số không đúng (VD: 15C12345).",
      }),
    driverName: Joi.string().required().messages({
      "string.empty": "Tên tài xế là bắt buộc.",
      "any.required": "Tên tài xế là bắt buộc.",
      "string.min": "Tên tài xế phải từ 3 ký tự trở lên.",
    }),
    driverPhone: Joi.string()
      .required()
      .regex(/^(0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.empty": "Số điện thoại tài xế là bắt buộc.",
        "any.required": "Số điện thoại tài xế là bắt buộc.",
        "string.pattern": "Số điện thoại không đúng định dạng Việt Nam.",
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
      .regex(/^([0-9]{2})([A-Z]{1})([0-9]{5})$/)
      .messages({
        "string.empty": "Biển số xe là bắt buộc.",
        "any.required": "Biển số xe là bắt buộc.",
        "string.pattern": "Định dạng biển số không đúng (VD: 15C12345).",
      }),
    driverName: Joi.string().required().messages({
      "string.empty": "Tên tài xế là bắt buộc.",
      "any.required": "Tên tài xế là bắt buộc.",
      "string.min": "Tên tài xế phải từ 3 ký tự trở lên.",
    }),
    driverPhone: Joi.string()
      .required()
      .regex(/^(0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.empty": "Số điện thoại tài xế là bắt buộc.",
        "any.required": "Số điện thoại tài xế là bắt buộc.",
        "string.pattern": "Số điện thoại không đúng định dạng Việt Nam.",
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
