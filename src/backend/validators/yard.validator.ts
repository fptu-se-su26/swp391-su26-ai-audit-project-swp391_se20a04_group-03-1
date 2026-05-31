import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const yardPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Tên bãi đỗ là bắt buộc.",
      "any.required": "Tên bãi đỗ là bắt buộc.",
    }),
    cameraIp: Joi.string().required().messages({
      "string.empty": "Địa chỉ IP Camera là bắt buộc.",
      "any.required": "Địa chỉ IP Camera là bắt buộc.",
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
