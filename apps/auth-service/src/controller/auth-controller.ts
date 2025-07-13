
// New user

import { NextFunction, Request, Response } from "express";
import { validateRegistrationData } from "../utils/auth-helper";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/lib/prisma";



export const userRegistration = async(req: Request, res: Response , next:NextFunction) => {
  validateRegistrationData(req.body, "user");
  const { name, email } = req.body;
  
  const existingUser = await prisma.users.findUnique({
    where: {
      email
    }
  });

  if(existingUser) {
    return next( new ValidationError(`User with email ${email} already exists!`));
  }

  await prisma.users.create({
    data: {
      name,
      email
    }
  });
}