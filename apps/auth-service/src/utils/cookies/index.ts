import { Response } from "express";

export const setCookies = (res: Response, name: string, value: string) =>
  res.cookie(
    name,
    value,
    {
      httpOnly: true,
      secure: true,
      sameSite: "none", maxAge: 1000 * 60 * 60 * 24
    }
  );