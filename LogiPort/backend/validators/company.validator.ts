import Joi from "joi";
import { NextFunction, Request, Response } from "express";
export const companyPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    companyCode: Joi.string()
      .required()
      .regex(/^[A-Z0-9-]{3,20}$/)
      .messages({
        "string.empty": "Mã công ty là bắt buộc.",
        "any.required": "Mã công ty là bắt buộc.",
        "string.pattern.base":
          "Mã công ty chỉ gồm chữ in hoa, số và dấu gạch ngang (3-20 ký tự).",
      }),
    companyName: Joi.string().required().min(3).messages({
      "string.empty": "Tên công ty là bắt buộc.",
      "any.required": "Tên công ty là bắt buộc.",
      "string.min": "Tên công ty phải từ 3 ký tự trở lên.",
    }),
    contactPerson: Joi.string().required().messages({
      "string.empty": "Tên người liên hệ là bắt buộc.",
      "any.required": "Tên người liên hệ là bắt buộc.",
    }),
    contactPhone: Joi.string()
      .required()
      .regex(/^(0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.empty": "Số điện thoại là bắt buộc.",
        "any.required": "Số điện thoại là bắt buộc.",
        "string.pattern.base": "Số điện thoại không đúng định dạng Việt Nam.",
      }),
    email: Joi.string().required().email().messages({
      "string.empty": "Email là bắt buộc.",
      "any.required": "Email là bắt buộc.",
      "string.email": "Email không hợp lệ.",
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

export const companyEdit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    id: Joi.string().required().messages({
      "string.empty": "ID công ty là bắt buộc.",
      "any.required": "ID công ty là bắt buộc.",
    }),
    companyCode: Joi.string()
      .required()
      .regex(/^[A-Z0-9-]{3,20}$/)
      .messages({
        "string.empty": "Mã công ty là bắt buộc.",
        "any.required": "Mã công ty là bắt buộc.",
        "string.pattern.base":
          "Mã công ty chỉ gồm chữ in hoa, số và dấu gạch ngang (3-20 ký tự).",
      }),
    companyName: Joi.string().required().min(3).messages({
      "string.empty": "Tên công ty là bắt buộc.",
      "any.required": "Tên công ty là bắt buộc.",
      "string.min": "Tên công ty phải từ 3 ký tự trở lên.",
    }),
    contactPerson: Joi.string().required().messages({
      "string.empty": "Tên người liên hệ là bắt buộc.",
      "any.required": "Tên người liên hệ là bắt buộc.",
    }),
    contactPhone: Joi.string()
      .required()
      .regex(/^(0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.empty": "Số điện thoại là bắt buộc.",
        "any.required": "Số điện thoại là bắt buộc.",
        "string.pattern.base": "Số điện thoại không đúng định dạng Việt Nam.",
      }),
    email: Joi.string().required().email().messages({
      "string.empty": "Email là bắt buộc.",
      "any.required": "Email là bắt buộc.",
      "string.email": "Email không hợp lệ.",
    }),
    status: Joi.string()
      .valid("Active", "Inactive", "Suspended")
      .required()
      .messages({
        "string.empty": "Trạng thái là bắt buộc.",
        "any.required": "Trạng thái là bắt buộc.",
        "any.only": "Trạng thái không hợp lệ.",
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
