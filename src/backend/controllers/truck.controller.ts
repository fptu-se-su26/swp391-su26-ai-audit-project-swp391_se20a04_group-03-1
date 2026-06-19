import { Request, Response } from "express";
import { Truck } from "../models/truck.model";

export const trucksGet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, limit = 20 } = req.query;
    
    let query: any = { isDeleted: false };
    if (search) {
      query.truckPlate = { $regex: search.toString(), $options: "i" };
    }

    const trucks = await Truck.find(query)
      .populate("companyId", "companyName companyCode")
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      code: "success",
      data: trucks,
    });
  } catch (error) {
    console.error("Error fetching trucks:", error);
    res.status(500).json({ code: "error", message: "Lỗi máy chủ" });
  }
};
