import type { Request, Response } from "express";
import { searchService } from "../services/search.service";
import { asyncHandler } from "../utils/asyncHandler";

export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const data = await searchService.search(req.query as unknown as Parameters<typeof searchService.search>[0]);
    res.json({ success: true, data });
  })
};
