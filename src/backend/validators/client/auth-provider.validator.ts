import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const registerPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    code: Joi.string().required().messages({
      "string.empty": "Mã nhà cung cấp là bắt buộc.",
      "any.required": "Mã nhà cung cấp là bắt buộc.",
    }),
    name: Joi.string().required().messages({
      "string.empty": "Tên nhà cung cấp là bắt buộc.",
      "any.required": "Tên nhà cung cấp là bắt buộc.",
    }),
    contact_email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email là bắt buộc.",
        "string.email": "Email không hợp lệ.",
        "any.required": "Email là bắt buộc.",
      }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Mật khẩu là bắt buộc.",
      "string.min": "Mật khẩu phải có ít nhất 6 ký tự.",
      "any.required": "Mật khẩu là bắt buộc.",
    }),
    roleCode: Joi.string().required().messages({
      "string.empty": "Vai trò là bắt buộc.",
      "any.required": "Vai trò là bắt buộc.",
    }),
    bic_codes: Joi.string().allow("").optional(),
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

export const loginPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email là bắt buộc.",
        "string.email": "Email không hợp lệ.",
        "any.required": "Email là bắt buộc.",
      }),
    password: Joi.string().required().messages({
      "string.empty": "Mật khẩu là bắt buộc.",
      "any.required": "Mật khẩu là bắt buộc.",
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

export const forgotPasswordPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email là bắt buộc.",
        "string.email": "Email không hợp lệ.",
        "any.required": "Email là bắt buộc.",
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

export const otpPasswordPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email là bắt buộc.",
        "string.email": "Email không hợp lệ.",
        "any.required": "Email là bắt buộc.",
      }),
    otp: Joi.string().length(6).required().messages({
      "string.empty": "Mã OTP là bắt buộc.",
      "string.length": "Mã OTP phải gồm 6 chữ số.",
      "any.required": "Mã OTP là bắt buộc.",
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

export const resetPasswordPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email là bắt buộc.",
        "string.email": "Email không hợp lệ.",
        "any.required": "Email là bắt buộc.",
      }),
    otp: Joi.string().required().messages({
      "string.empty": "Mã OTP là bắt buộc.",
      "any.required": "Mã OTP là bắt buộc.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Mật khẩu là bắt buộc.",
      "string.min": "Mật khẩu phải có ít nhất 6 ký tự.",
      "any.required": "Mật khẩu là bắt buộc.",
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
