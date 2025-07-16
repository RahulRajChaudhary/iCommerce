
// New user

import { NextFunction, Request, Response } from "express";
import { checkOtpRestriction, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth-helper";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/lib/prisma";
import bcrypt from 'bcryptjs';


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


export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name , email,password, otp } = req.body;
    if(!name || !email || !password || !otp){ 
      return next(new ValidationError(`Please provide all the required fields for registration`));
    }
    console.log(name , email,password, otp)

    const existingUser = await prisma.users.findUnique({
      where: {
        email
      }
    });   
    if (existingUser) {
      return next(new ValidationError(`User with email already exists!`));
    }
    await verifyOtp(email, otp, next);
 
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}