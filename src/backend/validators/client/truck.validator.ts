import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const truckPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    truckPlate: Joi.string()
      .required()
      .regex(/^[0-9]{2}[A-Z][A-Z0-9]?[0-9]{4,5}$/)
      .messages({
        "string.empty": "Biển số xe là bắt buộc.",
        "any.required": "Biển số xe là bắt buộc.",
        "string.pattern.base": "Định dạng sai (VD: 15C12345 hoặc 29H112345).",
        "string.pattern": "Định dạng sai (VD: 15C12345 hoặc 29H112345).",
      }),
    truckType: Joi.string().optional().messages({
      "string.empty": "Loại xe không được để trống.",
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

export const truckEdit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    truckPlate: Joi.string()
      .required()
      .regex(/^[0-9]{2}[A-Z][A-Z0-9]?[0-9]{4,5}$/)
      .messages({
        "string.empty": "Biển số xe là bắt buộc.",
        "any.required": "Biển số xe là bắt buộc.",
        "string.pattern.base": "Định dạng sai (VD: 15C12345 hoặc 29H112345).",
        "string.pattern": "Định dạng sai (VD: 15C12345 hoặc 29H112345).",
      }),
    truckType: Joi.string().optional().messages({
      "string.empty": "Loại xe không được để trống.",
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
