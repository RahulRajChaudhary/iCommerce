
// New user

import { NextFunction, Request, Response } from "express";
import { checkOtpRestriction, sendOtp, trackOtpRequests, validateRegistrationData } from "../utils/auth-helper";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/lib/prisma";



export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      return next(new ValidationError(`User with email ${email} already exists!`));
    }

    await checkOtpRestriction(email, next);
    await trackOtpRequests(email, next)
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({ message: "Otp sent successfully on email" });
  } catch (error) {
    return next(error);
  }
}