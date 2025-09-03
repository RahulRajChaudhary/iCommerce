
// New user

import { NextFunction, Request, Response } from "express";
import { checkOtpRestriction, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp, verifyForgotPasswordOtp } from "../utils/auth-helper";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/lib/prisma";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setCookies } from "../utils/cookies";
// import Razorpay from 'razorpay';

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

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
    const refreshToken = jwt.sign({ id: user.id, role: "user" }, process.env.REFRESH_JWT_SECRET!, {
      expiresIn: "7d"
    });

    //storing the token and httponly

    setCookies(res, "accessToken", accessToken);
    setCookies(res, "refreshToken", refreshToken);

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


export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log('Refresh token from cookies:', refreshToken);

    if (!refreshToken) {
      // Send a proper response instead of returning an error object
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Please login to get access token"
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET!) as {
      id: string,
      role: string
    };

    if (!decoded || !decoded.id || !decoded.role) {
      // Send a proper response instead of returning an error object
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Invalid refresh token"
      });
    }

    console.log(decoded.id, decoded.role);

    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id
      }
    });

    if (!user) {
      // Send a proper response instead of using next()
      return res.status(404).json({
        success: false,
        message: "User not found!"
      });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_JWT_SECRET!,
      { expiresIn: "15m" }
    );

    setCookies(res, "accessToken", newAccessToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });

  } catch (error) {
    console.log('Refresh token error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired"
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    // For other errors, pass to the error handler
    return next(error);
  }
};



// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = (req).user;
    console.log(user)
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

// register a new seller

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const exisitingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (exisitingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await checkOtpRestriction(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation-mail");

    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    next(error);
  }
};

// verify seller otp

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError("All fields are required!"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller)
      return next(
        new ValidationError("Seller already exists with this email!")
      );

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    res
      .status(201)
      .json({ seller, message: "Seller registered successfully!" });
  } catch (error) {
    next(error);
  }
};

// create a new shop

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (!name || !bio || !address || !sellerId || !opening_hours || !category) {
      return next(new ValidationError("All fields are required!"));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    next(error);
  }
};


// stripe account add

export const addStripeAccountId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId, stripeAccountId } = req.body;

    if (!sellerId || !stripeAccountId) {
      return next(new ValidationError("Seller ID and Stripe Account ID are required!"));
    }

    // Enhanced cleaning and validation
    const cleanedStripeAccountId = stripeAccountId
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9_]/g, ''); // Remove any special characters except underscores

    // More robust validation for Stripe account ID format
    if (!cleanedStripeAccountId.startsWith('acct_')) {
      return next(new ValidationError("Invalid Stripe account ID format. It should start with 'acct_'"));
    }

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller is not available with this id!"));
    }

    // Skip verification since we don't have Connect access
    console.log("Skipping Stripe account verification due to missing Connect permissions");
    console.log("Storing account ID for future use:", cleanedStripeAccountId);

    // Update the seller with the provided Stripe account ID
    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: cleanedStripeAccountId,
      },
    });

    res.json({
      success: true,
      message: "Stripe account ID stored successfully. You'll be able to receive payments once we complete our Stripe Connect setup.",
      stripeAccountId: cleanedStripeAccountId
    });
  } catch (error) {
    console.error("Add Stripe account error:", error);
    return next(error);
  }
};

// Function to create Stripe Connect link (for future use)
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) return next(new ValidationError("Seller ID is required!"));

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller is not available with this id!"));
    }

    // Check if seller already has a Stripe account ID
    if (seller.stripeId) {
      return res.json({
        message: "Stripe account already connected",
        stripeAccountId: seller.stripeId,
        alreadyConnected: true
      });
    }

    // For now, we'll just return a message about manual setup
    res.json({
      message: "Please add your Stripe account ID to receive payments",
      manualSetupRequired: true
    });
  } catch (error) {
    return next(error);
  }
};








// Initialize Razorpay


// Create Razorpay connected account
// export const createRazorpayAccount = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { sellerId } = req.body;

//     if (!sellerId) return next(new ValidationError("Seller ID is required!"));

//     const seller = await prisma.sellers.findUnique({
//       where: {
//         id: sellerId,
//       },
//     });

//     if (!seller) {
//       return next(new ValidationError("Seller is not available with this id!"));
//     }

//     // Create a Razorpay connected account
//     const account = await razorpay.accounts.create({
//       email: seller.email,
//       type: "route", // For marketplace functionality
//       profile: {
//         category: "ecommerce", // Adjust based on your business
//         subcategory: "online_store",
//         address: {
//           street1: "Not provided", // You might want to collect this
//           city: "Not provided",
//           state: "Not provided",
//           postal_code: "000000",
//           country: seller.country || "IN", // Default to India
//         },
//         business_model: "marketplace", // Important for transfers
//       },
//     });

//     // Store Razorpay account details
//     await prisma.sellers.update({
//       where: {
//         id: sellerId,
//       },
//       data: {
//         razorpayId: account.id,
//         razorpayAccountDetails: account,
//       },
//     });

//     // Create onboarding link (Razorpay doesn't have a direct equivalent of Stripe's account links)
//     // You'll need to redirect the seller to complete their profile
//     res.json({
//       message: "Razorpay account created successfully. Seller needs to complete their profile.",
//       accountId: account.id,
//       // You might want to redirect to Razorpay's dashboard or provide instructions
//     });
//   } catch (error) {
//     console.error("Razorpay Account Creation Error:", error);
//     return next(error);
//   }
// };

// // Create a transfer to seller (payout)
// export const createRazorpayTransfer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { sellerId, amount, currency = "INR" } = req.body;

//     if (!sellerId || !amount) {
//       return next(new ValidationError("Seller ID and amount are required!"));
//     }

//     const seller = await prisma.sellers.findUnique({
//       where: {
//         id: sellerId,
//       },
//     });

//     if (!seller || !seller.razorpayId) {
//       return next(new ValidationError("Seller or Razorpay account not found!"));
//     }

//     // Create a transfer to the seller's Razorpay account
//     // Note: This is a simplified example - you'll need to adapt based on your payment flow
//     const transfer = await razorpay.payments.transfer({
//       amount: amount * 100, // Convert to paise
//       currency,
//       linked_account: seller.razorpayId, // The connected account
//       // You might need additional parameters based on your setup
//     });

//     res.json({
//       success: true,
//       transferId: transfer.id,
//       message: "Transfer initiated successfully",
//     });
//   } catch (error) {
//     console.error("Razorpay Transfer Error:", error);
//     return next(error);
//   }
// };

// login seller

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new ValidationError("Email and password are required!"));

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) return next(new ValidationError("Invalid email or password!"));

    // Verify password
    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch)
      return next(new ValidationError("Invalid email or password!"));

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_JWT_SECRET as string,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // store refresh token and access token
    setCookies(res, "seller-refresh-token", refreshToken);
    setCookies(res, "seller-access-token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    next(error);
  }
};


export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;

    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};