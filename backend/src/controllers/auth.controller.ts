import type { Request, Response } from "express";
import { authService, refreshCookieOptions } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.refreshToken);
    res.json({ success: true, data: result });
  }),

  google: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.google(req.body.idToken);
    setRefreshCookie(res, result.refreshToken);
    res.json({ success: true, data: result });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.refreshToken ?? req.cookies?.refreshToken;
    const result = await authService.refresh(token);
    setRefreshCookie(res, result.refreshToken);
    res.json({ success: true, data: result });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user?.id);
    res.clearCookie("refreshToken", refreshCookieOptions);
    res.status(204).send();
  })
};
