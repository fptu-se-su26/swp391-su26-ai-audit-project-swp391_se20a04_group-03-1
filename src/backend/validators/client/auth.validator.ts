import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const registerPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    companyCode: Joi.string().required().messages({
      "string.empty": "Mã số thuế/Mã doanh nghiệp không được để trống",
      "any.required": "Mã số thuế/Mã doanh nghiệp là bắt buộc",
    }),
    companyName: Joi.string().required().messages({
      "string.empty": "Tên doanh nghiệp không được để trống",
      "any.required": "Tên doanh nghiệp là bắt buộc",
    }),
    contactPerson: Joi.string().required().messages({
      "string.empty": "Người đại diện không được để trống",
      "any.required": "Người đại diện là bắt buộc",
    }),
    contactPhone: Joi.string().required().messages({
      "string.empty": "Số điện thoại không được để trống",
      "any.required": "Số điện thoại là bắt buộc",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Email không đúng định dạng",
      "string.empty": "Email không được để trống",
      "any.required": "Email là bắt buộc",
    }),
    role: Joi.string().required().messages({
      "string.empty": "Loại hình doanh nghiệp không được để trống",
      "any.required": "Loại hình doanh nghiệp là bắt buộc",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Mật khẩu phải chứa ít nhất 6 ký tự",
      "string.empty": "Mật khẩu không được để trống",
      "any.required": "Mật khẩu là bắt buộc",
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

export const loginPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email không đúng định dạng",
      "string.empty": "Email không được để trống",
      "any.required": "Email là bắt buộc",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Mật khẩu không được để trống",
      "any.required": "Mật khẩu là bắt buộc",
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
    email: Joi.string().email().required().messages({
      "string.email": "Email không hợp lệ!",
      "string.empty": "Vui lòng nhập email!",
      "any.required": "Vui lòng nhập email!",
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    res.json({ code: "error", message: error.details[0].message });
    return;
  }
  next();
};

export const otpPasswordPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập mã OTP!",
      "any.required": "Vui lòng nhập mã OTP!",
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    res.json({ code: "error", message: error.details[0].message });
    return;
  }
  next();
};

export const resetPasswordPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập mã OTP!",
      "any.required": "Vui lòng nhập mã OTP!",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Mật khẩu phải từ 6 ký tự!",
      "string.empty": "Vui lòng nhập mật khẩu mới!",
      "any.required": "Vui lòng nhập mật khẩu mới!",
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    res.json({ code: "error", message: error.details[0].message });
    return;
  }
  next();
};
