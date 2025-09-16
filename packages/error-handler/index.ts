
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details ?: any;

  constructor(message: string, statusCode: number, isOperational = true, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details
    Error.captureStackTrace(this)
  }
}

// not found error

export class NotFoundError extends AppError{
  constructor(message = "Resource not found") {
    super(message,404)
  }
}

// validation error

export class ValidationError extends AppError {
  constructor(message = "Invaild Request Data", details?: any) {
    super(message, 400 ,true, details)
  }
}

// auth error

export class AuthError extends AppError{
  constructor(message = "Unauthorizes") {
    super(message,401)
  }
}

// Restricted area or page error

export class ForbiddenError extends AppError {
  constructor(message = "Not allowed") {
    super(message, 403);
  }
}


// db error

export class DatabaseError extends AppError{
  constructor(message = "Database Error", details ?: any){
    super(message , 500 , true , details)
  }
}

// Rate Limit for ddos

export class RateLimitError extends AppError{
  constructor(message = "Too many request, try after sometime") {
    super(message, 429)
  }
}