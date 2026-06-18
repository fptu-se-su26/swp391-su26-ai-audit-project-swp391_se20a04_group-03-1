import Joi from "joi";
import { NextFunction, Request, Response } from "express";

export const companyRolePost = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    roleCode: Joi.string()
      .required()
      .regex(/^[A-Z0-9_]{3,30}$/)
      .messages({
        "string.empty": "Mã phân loại là bắt buộc.",
        "any.required": "Mã phân loại là bắt buộc.",
        "string.pattern.base":
          "Mã phân loại chỉ gồm chữ in hoa, số và dấu gạch dưới (3-30 ký tự).",
      }),
    roleName: Joi.string().required().min(3).messages({
      "string.empty": "Tên loại hình là bắt buộc.",
      "any.required": "Tên loại hình là bắt buộc.",
      "string.min": "Tên loại hình phải từ 3 ký tự trở lên.",
    }),
    description: Joi.string().allow("").optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.json({
      code: "error",
      message: error.details[0].message,
    });
  }

  next();
};

export const companyRolePatch = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    roleCode: Joi.string()
      .required()
      .regex(/^[A-Z0-9_]{3,30}$/)
      .messages({
        "string.empty": "Mã phân loại là bắt buộc.",
        "any.required": "Mã phân loại là bắt buộc.",
        "string.pattern.base":
          "Mã phân loại chỉ gồm chữ in hoa, số và dấu gạch dưới (3-30 ký tự).",
      }),
    roleName: Joi.string().required().min(3).messages({
      "string.empty": "Tên loại hình là bắt buộc.",
      "any.required": "Tên loại hình là bắt buộc.",
      "string.min": "Tên loại hình phải từ 3 ký tự trở lên.",
    }),
    description: Joi.string().allow("").optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.json({
      code: "error",
      message: error.details[0].message,
    });
  }

  next();
};
