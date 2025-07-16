// common user for user and sellers

import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import redis from '../../../../packages/lib/redis';
import { sendEmail } from './sendMail';
import { NextFunction, Request, Response } from 'express';
import prisma from '../../../../packages/lib/prisma';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`Please provide all the required fields for registration`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Please provide a valid email address`);
  }
}


export const checkOtpRestriction = async (email: string, next: NextFunction) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(new ValidationError("Too many attempts, please try again after 30 min"));
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(new ValidationError("Too many otp requests, please try again after 1hr"));
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(new ValidationError("Please wait for 1 minute before sending another otp"));
  }
}

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt(await redis.get(otpRequestKey) || "0");
  if (otpRequests >= 5) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); //1hr lcok
    return next(new ValidationError("Too many otp requests, please try again after 1hr"));
  }
  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600);
}


export const sendOtp = async (name: string, email: string, template: string) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  // sending mail
  await sendEmail(email, "OTP Verification", template, { name, otp });

  // setting otp in redis with expiry
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
}

export const verifyOtp = async (email: string, otp: string, next: NextFunction) => {

  const storedOtp = await redis.get(`otp:${email}`);
  
  if (!storedOtp) {
    throw new ValidationError("Invalid or expired OTP!");
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  let failedAttempts = parseInt(await redis.get(failedAttemptsKey) || "0");
  if (storedOtp !== otp) {
    if (failedAttempts >= 3) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 900); //15min lock
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError("Too many attempts, please try again after 15 min");
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
    throw new ValidationError(`Incorrect OTP. You have ${3 - failedAttempts} attempts left.`);
  }
  await redis.del(`otp:${email}`, failedAttemptsKey);
}

export const handleForgotPassword = async (req: Request, res: Response, next: NextFunction, userType: "user" | "seller") => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError(`Please provide a valid email address`);
    }

    // finding user

    const user = userType === "user" && await prisma.users.findUnique({
      where: {
        email
      }
    }); 
    if(!user){
      throw new ValidationError(`User not found!`);
    }
    await checkOtpRestriction(email, next);
    await trackOtpRequests(email, next)
    await sendOtp(user.name!, email, "user-forgot-password-mail");
    res.status(200).json({ message: "Otp sent successfully on email" });

  } catch (error) {
    return next(error);
  }
}

export const verifyForgotPasswordOtp = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError(`Email and Otp are required for reset password`);
    }
    await verifyOtp(email, otp, next);
    res.status(200).json({ message: "Otp verified successfully" });
  } catch (error) {
    return next(error);
  }
}   