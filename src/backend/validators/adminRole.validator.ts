import Joi from "joi";
import { NextFunction, Request, Response } from "express";

const permissionItem = Joi.object({
  resource: Joi.string().required(),
  actions: Joi.array().items(Joi.string()).default([]),
});

const roleSchema = Joi.object({
  roleCode: Joi.string()
    .required()
    .regex(/^[A-Z0-9_]{3,30}$/)
    .messages({
      "string.empty": "Mã vai trò là bắt buộc.",
      "any.required": "Mã vai trò là bắt buộc.",
      "string.pattern.base":
        "Mã vai trò chỉ gồm chữ in hoa, số và dấu gạch dưới (3-30 ký tự).",
    }),
  roleName: Joi.string().required().min(3).messages({
    "string.empty": "Tên vai trò là bắt buộc.",
    "any.required": "Tên vai trò là bắt buộc.",
    "string.min": "Tên vai trò phải từ 3 ký tự trở lên.",
  }),
  description: Joi.string().allow("").optional(),
  permissions: Joi.array().items(permissionItem).default([]),
});

const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.json({ code: "error", message: error.details[0].message });
    }
    next();
  };

export const adminRolePost = validate(roleSchema);
export const adminRolePatch = validate(roleSchema);
