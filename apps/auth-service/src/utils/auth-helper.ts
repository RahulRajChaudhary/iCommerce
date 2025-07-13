// common user for user and sellers

import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const validateRegistrationData = (data: any , userType: "user" | "seller") => {
  const { name, email, password, phone_number, country } = data;
  
  if(!name || !email || !password || (userType === "seller" && (!phone_number ||  !country))) {
    throw new ValidationError(`Please provide all the required fields for registration`);
  }

  if(!emailRegex.test(email)) {
    throw new ValidationError(`Please provide a valid email address`);
  }
}
