import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";
import { ActorKind, runWithActor } from "../helpers/audit-context";
import { resolveActor, systemActor } from "../helpers/resolve-actor";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Đặt "ai đang thao tác" vào ngữ cảnh request rồi chạy tiếp chuỗi middleware.
 * Plugin audit (models/audit.plugin.ts) đọc lại khi ghi DB.
 *
 * Bỏ qua GET: request đọc không ghi gì, tra tên actor sẽ tốn một truy vấn vô ích.
 */
const withActor = async (
  req: Request,
  kind: ActorKind,
  next: NextFunction,
): Promise<void> => {
  if (req.method === "GET") return next();
  const actor = await resolveActor(kind, req.user);
  runWithActor(actor, () => next());
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 0. Bỏ qua xác thực nếu là request nội bộ từ AI Server
    const internalSecret = req.headers["x-internal-secret"];
    if (internalSecret === "AI_SERVER_SECRET_KEY") {
      // CV server ghi dữ liệu (đồng bộ bãi, quét cổng) -> đóng dấu "Hệ thống".
      return runWithActor(systemActor(), () => next());
    }

    // 1. Lấy token từ cookie
    const token = req.cookies.tokenAdmin;
    if (!token) {
      return res.status(400).json({ code: "error", message: "Vui lòng đăng nhập" });
    }
    // 2. Giải mã token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    // 3. LẤY TOKEN ĐANG LƯU TỪ REDIS RA ĐỐI CHIẾU
    const activeVersion = await redisClient.get(`auth:session:${decoded.id}`);
    // So sánh Version trong Token gửi lên VÀ Version trong Redis
    if (!activeVersion || decoded.tokenVersion !== activeVersion) {
      res.clearCookie("tokenAdmin", {
        httpOnly: true,
        sameSite: "lax", //cho phep gui cookie linh hoat giua cac website
        domain:
          process.env.NODE_ENV === "production"
            ? (process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.replace(/['"]/g, '').trim() : undefined)
            : "localhost", // Thêm dấu chấm này để Token có hiệu lực ở mọi nơi
        path: "/",
        secure: process.env.NODE_ENV === "production", // https: true, http: false
      });
      return res.status(400).json({
        code: "error",
        message: "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác.",
      });
    }
    // 4. Nếu khớp 100%, cho phép đi qua và đính kèm thông tin user
    req.user = decoded;
    return withActor(req, "admin", next);
  } catch (error) {
    res.clearCookie("tokenAdmin", {
      httpOnly: true,
      sameSite: "lax", //cho phep gui cookie linh hoat giua cac website
      domain:
        process.env.NODE_ENV === "production"
          ? (process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.replace(/['"]/g, '').trim() : undefined)
          : "localhost", // Thêm dấu chấm này để Token có hiệu lực ở mọi nơi
      path: "/",
      secure: process.env.NODE_ENV === "production", // https: true, http: false
    });
    return res.status(400).json({
      code: "error",
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    });
  }
};

export const requireAuthCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.tokenCompany;
    if (!token) {
      return res.status(400).json({ code: "error", message: "Vui lòng đăng nhập" });
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const activeVersion = await redisClient.get(`auth:company:session:${decoded.id}`);
    
    if (!activeVersion || decoded.tokenVersion !== activeVersion) {
      res.clearCookie("tokenCompany", {
        httpOnly: true,
        sameSite: "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? (process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.replace(/['"]/g, '').trim() : undefined)
            : "localhost",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(400).json({
        code: "error",
        message: "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác.",
      });
    }
    
    req.user = decoded;
    return withActor(req, "company", next);
  } catch (error) {
    res.clearCookie("tokenCompany", {
      httpOnly: true,
      sameSite: "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? (process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.replace(/['"]/g, '').trim() : undefined)
          : "localhost",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(400).json({
      code: "error",
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    });
  }
};

export const requireAuthProvider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.tokenProvider;
    if (!token) {
      return res.status(400).json({ code: "error", message: "Vui lòng đăng nhập" });
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const activeVersion = await redisClient.get(`auth:provider:session:${decoded.id}`);
    
    if (!activeVersion || decoded.tokenVersion !== activeVersion) {
      res.clearCookie("tokenProvider", {
        httpOnly: true,
        sameSite: "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? (process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.replace(/['"]/g, '').trim() : undefined)
            : "localhost",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(400).json({
        code: "error",
        message: "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác.",
      });
    }
    
    req.user = decoded;
    return withActor(req, "provider", next);
  } catch (error) {
    res.clearCookie("tokenProvider", {
      httpOnly: true,
      sameSite: "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? (process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.replace(/['"]/g, '').trim() : undefined)
          : "localhost",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(400).json({
      code: "error",
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    });
  }
};
