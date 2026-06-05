import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const gatePost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Tên camera cổng là bắt buộc.",
      "any.required": "Tên camera cổng là bắt buộc.",
    }),
    cameraIp: Joi.string().required().messages({
      "string.empty": "Địa chỉ IP/RTSP Camera là bắt buộc.",
      "any.required": "Địa chỉ IP/RTSP Camera là bắt buộc.",
    }),
    type: Joi.string().valid("in", "out").required().messages({
      "string.empty": "Loại cổng là bắt buộc.",
      "any.required": "Loại cổng là bắt buộc.",
      "any.only": "Loại cổng phải là 'in' hoặc 'out'."
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
