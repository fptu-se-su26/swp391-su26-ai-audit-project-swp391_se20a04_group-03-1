import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const createAdminPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({

    fullName: Joi.string().required().messages({
      "string.empty": "Họ và tên không được để trống",
      "any.required": "Họ và tên là bắt buộc",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Email không đúng định dạng",
      "string.empty": "Email không được để trống",
      "any.required": "Email là bắt buộc",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Mật khẩu phải chứa ít nhất 6 ký tự",
      "string.empty": "Mật khẩu không được để trống",
      "any.required": "Mật khẩu là bắt buộc",
    }),
    role: Joi.string().required().messages({
      "string.empty": "Vai trò không được để trống",
      "any.required": "Vai trò là bắt buộc",
    }),
    status: Joi.string().valid("active", "pending").required().messages({
      "any.only": "Trạng thái không hợp lệ",
      "any.required": "Trạng thái là bắt buộc",
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

export const editAdminPatch = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    fullName: Joi.string().required().messages({
      "string.empty": "Họ và tên không được để trống",
      "any.required": "Họ và tên là bắt buộc",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Email không đúng định dạng",
      "string.empty": "Email không được để trống",
      "any.required": "Email là bắt buộc",
    }),
    role: Joi.string().required().messages({
      "string.empty": "Vai trò không được để trống",
      "any.required": "Vai trò là bắt buộc",
    }),
    status: Joi.string()
      .valid("active", "pending", "banned")
      .required()
      .messages({
        "any.only": "Trạng thái không hợp lệ",
        "any.required": "Trạng thái là bắt buộc",
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
