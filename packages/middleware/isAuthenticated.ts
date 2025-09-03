import prisma from "../lib/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["accessToken"] ||
      req.cookies["seller-access-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing." });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET!) as {
      id: string;
      role: "user" | "seller" | "admin";
    };

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized! Invalid token.",
      });
    }

    let account;

    if (decoded.role === "user" || decoded.role === "admin") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if(decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: {
          shop: true
        }
      });
      req.seller = account;
    }

    if (!account) {
      return res.status(401).json({ message: "Account not found!" });
    }

    req.role = decoded.role;

    return next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unauthorized! Token expired or invalid." });
  }
};

export default isAuthenticated;