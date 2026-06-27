import { Router } from "express";
import { Container } from "../../models/container.model";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, limit = "20" } = req.query;
    let query: any = { isDeleted: false };
    if (search) {
      query.number = new RegExp(search as string, "i");
    }
    const data = await Container.find(query).limit(parseInt(limit as string));
    res.status(200).json({ code: "success", data });
  } catch (error) {
    res.status(400).json({ code: "error", message: "Lỗi hệ thống" });
  }
});

export default router;
