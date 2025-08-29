
// New user

import { NextFunction, Request, Response } from "express";
import { checkOtpRestriction, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp, verifyForgotPasswordOtp } from "../utils/auth-helper";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/lib/prisma";
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookies } from "../utils/cookies";


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
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return next(new ValidationError(`Please provide all the required fields for registration`));
    }
    console.log(name, email, password, otp)

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


// login user

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError(`Please provide all the required fields for login`));
    }
    const user = await prisma.users.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return next(new AuthError(`User not found!`));
    }
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError(`Incorrect password or email!`));
    }

    // access token and referesh token

    const accessToken = jwt.sign({ id: user.id, role: "user" }, process.env.ACCESS_JWT_SECRET!, {
      expiresIn: "15m"
    });
    const refereshToken = jwt.sign({ id: user.id, role: "user" }, process.env.REFRESH_JWT_SECRET!, {
      expiresIn: "7d"
    });

    //storing the token and httponly

    setCookies(res, "accessToken", accessToken);
    setCookies(res, "refereshToken", refereshToken);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    return next(error);
  }
}

//referesh token

export const refereshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refereshToken = req.cookies.refereshToken;
    if (!refereshToken) {
      return new ValidationError(`Unauthorized! Please login to get access token`);
    }

    const decoded = jwt.verify(refereshToken, process.env.REFRESH_JWT_SECRET!) as { id: string, role: string }
    if (!decoded || !decoded.id ||
      !decoded.role) {
      return new JsonWebTokenError(`Unauthorized! Please login to get access token`);
    }


    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id
      }
    });
    if (!user) {
      return next(new ValidationError(`User not found!`));
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_JWT_SECRET!,
      { expiresIn: "15m" });

    setCookies(res, "accessToken", newAccessToken);
    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    })
  } catch (error) {
    return next(error);
  }
}



// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}


// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  await handleForgotPassword(req, res, next, "user");

}

// forgot password otp

export const verifyForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
    await verifyForgotPasswordOtp(req, res, next);
  } catch (error) {
    next(error);
  }
}

// user reset password

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError(`Please provide all the required fields for reset password`));
    }

    const user = await prisma.users.findUnique({
      where: {
        email
      }
    });
    if (!user) {
      return next(new ValidationError(`User not found!`));
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(new ValidationError(`New password should be different from old password`));
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: {
        email
      },
      data: {
        password: newHashedPassword
      }
    });
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user
    })
  } catch (error) {
    next(error);
  }
}  