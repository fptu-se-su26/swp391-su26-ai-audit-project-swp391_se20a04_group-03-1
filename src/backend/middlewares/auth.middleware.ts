import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 0. Bỏ qua xác thực nếu là request nội bộ từ AI Server
    const internalSecret = req.headers["x-internal-secret"];
    if (internalSecret === "AI_SERVER_SECRET_KEY") {
      return next();
    }

    // 1. Lấy token từ cookie
    const token = req.cookies.tokenAdmin;
    if (!token) {
      return res.json({ code: "error", message: "Vui lòng đăng nhập" });
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
      return res.json({
        code: "error",
        message: "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác.",
      });
    }
    // 4. Nếu khớp 100%, cho phép đi qua và đính kèm thông tin user
    req.user = decoded;
    next();
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
    return res.json({
      code: "error",
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    });
  }
};
