import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";

/**
 * Xác thực cho app mobile — biến thể Bearer (không dùng cookie như web).
 * Token nằm ở header `Authorization: Bearer <token>`.
 * Vẫn áp single-session lock qua Redis: key `auth:mobile:session:<id>`.
 *
 * Payload token mong đợi: { id, role: "driver" | "gate_manager", tokenVersion }
 */
export const requireMobileAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!token) {
      return res
        .status(401)
        .json({ code: "error", message: "Vui lòng đăng nhập" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Đối chiếu phiên đang hoạt động trong Redis (đăng nhập thiết bị mới -> đẩy cũ ra).
    const activeVersion = await redisClient.get(
      `auth:mobile:session:${decoded.id}`,
    );
    if (!activeVersion || decoded.tokenVersion !== activeVersion) {
      return res.status(401).json({
        code: "error",
        message: "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: "error",
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    });
  }
};

/**
 * Chặn theo vai trò. Dùng SAU requireMobileAuth.
 * VD: router.get("/appointments", requireMobileAuth, requireRole("driver"), ...)
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        code: "error",
        message: "Bạn không có quyền truy cập chức năng này",
      });
    }
    next();
  };
};
