import Joi from "joi";
import { NextFunction, Request, Response } from "express";

const runValidate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({ code: "error", message: error.details[0].message });
      return;
    }
    next();
  };

export const mobileLogin = runValidate(
  Joi.object({
    email: Joi.string().required().email().messages({
      "string.empty": "Email là bắt buộc.",
      "any.required": "Email là bắt buộc.",
      "string.email": "Email không hợp lệ.",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Mật khẩu là bắt buộc.",
      "any.required": "Mật khẩu là bắt buộc.",
    }),
  }),
);

export const gateScan = runValidate(
  Joi.object({
    qrToken: Joi.string().required().messages({
      "string.empty": "Thiếu mã QR.",
      "any.required": "Thiếu mã QR.",
    }),
  }),
);
