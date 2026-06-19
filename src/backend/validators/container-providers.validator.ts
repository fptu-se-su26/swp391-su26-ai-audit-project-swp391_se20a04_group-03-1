import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const providerPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    code: Joi.string()
      .required()
      .length(4)
      .regex(/^[A-Z]{4}$/)
      .messages({
        "string.empty": "Mã nhà cung cấp là bắt buộc.",
        "any.required": "Mã nhà cung cấp là bắt buộc.",
        "string.length": "Mã nhà cung cấp phải đúng 4 ký tự.",
        "string.pattern.base":
          "Mã nhà cung cấp chỉ gồm 4 chữ cái in hoa (VD: HLXU).",
      }),
    name: Joi.string().required().min(3).messages({
      "string.empty": "Tên nhà cung cấp là bắt buộc.",
      "any.required": "Tên nhà cung cấp là bắt buộc.",
      "string.min": "Tên nhà cung cấp phải từ 3 ký tự trở lên.",
    }),
    contact_email: Joi.string().required().email().messages({
      "string.empty": "Email liên hệ là bắt buộc.",
      "any.required": "Email liên hệ là bắt buộc.",
      "string.email": "Email không hợp lệ.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Mật khẩu phải chứa ít nhất 6 ký tự.",
      "string.empty": "Mật khẩu là bắt buộc.",
      "any.required": "Mật khẩu là bắt buộc.",
    }),
    bic_codes: Joi.array().items(Joi.string().length(3).regex(/^[A-Z]{3}$/)).optional().messages({
        "string.length": "Mã BIC phải gồm 3 chữ cái in hoa.",
        "string.pattern.base": "Mã BIC phải gồm 3 chữ cái in hoa."
    }),
    status: Joi.string().valid("ACTIVE", "INACTIVE", "SUSPENDED").optional()
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

export const providerEdit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    id: Joi.string().required().messages({
      "string.empty": "ID nhà cung cấp là bắt buộc.",
      "any.required": "ID nhà cung cấp là bắt buộc.",
    }),
    code: Joi.string()
      .required()
      .length(4)
      .regex(/^[A-Z]{4}$/)
      .messages({
        "string.empty": "Mã nhà cung cấp là bắt buộc.",
        "any.required": "Mã nhà cung cấp là bắt buộc.",
        "string.length": "Mã nhà cung cấp phải đúng 4 ký tự.",
        "string.pattern.base":
          "Mã nhà cung cấp chỉ gồm 4 chữ cái in hoa (VD: HLXU).",
      }),
    name: Joi.string().required().min(3).messages({
      "string.empty": "Tên nhà cung cấp là bắt buộc.",
      "any.required": "Tên nhà cung cấp là bắt buộc.",
      "string.min": "Tên nhà cung cấp phải từ 3 ký tự trở lên.",
    }),
    contact_email: Joi.string().required().email().messages({
      "string.empty": "Email liên hệ là bắt buộc.",
      "any.required": "Email liên hệ là bắt buộc.",
      "string.email": "Email không hợp lệ.",
    }),
    password: Joi.string().min(6).allow("").optional().messages({
      "string.min": "Mật khẩu phải chứa ít nhất 6 ký tự.",
    }),
    bic_codes: Joi.array().items(Joi.string().length(3).regex(/^[A-Z]{3}$/)).optional().messages({
        "string.length": "Mã BIC phải gồm 3 chữ cái in hoa.",
        "string.pattern.base": "Mã BIC phải gồm 3 chữ cái in hoa."
    }),
    status: Joi.string()
      .valid("ACTIVE", "INACTIVE", "SUSPENDED")
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
