import Joi from "joi";
import { NextFunction, Request, Response } from "express";

// Trường tài khoản mobile (email/password/status) là TÙY CHỌN — company có thể
// tạo tài xế không cấp tài khoản, hoặc cấp để tài xế đăng nhập app.
const accountFields = {
  email: Joi.string().allow("").optional().email().messages({
    "string.email": "Email không hợp lệ.",
  }),
  password: Joi.string().allow("").optional().min(6).messages({
    "string.min": "Mật khẩu phải từ 6 ký tự trở lên.",
  }),
  status: Joi.string().valid("Active", "Inactive").optional().messages({
    "any.only": "Trạng thái không hợp lệ.",
  }),
};

export const driverPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    driverId: Joi.string().required().messages({
      "string.empty": "Mã CCCD/GPLX là bắt buộc.",
      "any.required": "Mã CCCD/GPLX là bắt buộc.",
    }),
    driverName: Joi.string().required().messages({
      "string.empty": "Họ và tên tài xế là bắt buộc.",
      "any.required": "Họ và tên tài xế là bắt buộc.",
    }),
    driverPhone: Joi.string()
      .allow("")
      .optional()
      .regex(/^(0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.pattern.base": "Số điện thoại không đúng định dạng Việt Nam.",
      }),
    ...accountFields,
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

export const driverEdit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    driverId: Joi.string().required().messages({
      "string.empty": "Mã CCCD/GPLX là bắt buộc.",
      "any.required": "Mã CCCD/GPLX là bắt buộc.",
    }),
    driverName: Joi.string().required().messages({
      "string.empty": "Họ và tên tài xế là bắt buộc.",
      "any.required": "Họ và tên tài xế là bắt buộc.",
    }),
    driverPhone: Joi.string()
      .allow("")
      .optional()
      .regex(/^(0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.pattern.base": "Số điện thoại không đúng định dạng Việt Nam.",
      }),
    ...accountFields,
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
