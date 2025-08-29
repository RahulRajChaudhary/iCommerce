'use client'
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";

type FormData = {
  email: string
  password: string
};

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-password-user`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      setCanResend(false);
      startResendTimer();
      toast.success("OTP sent to your email!");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to send OTP. Please try again.";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-forgot-password-user`,
        { email: userEmail, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
      toast.success("OTP verified successfully!");
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })
        ?.message || "Invalid OTP. Please try again!";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!userEmail) throw new Error("Email not available");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`,
        { email: userEmail, newPassword: password }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success("Password reset successfully! Please login with your new password.");
      setServerError(null);
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })
        ?.message || "Failed to reset password. Please try again!";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmitEmail = (data: FormData) => {
    requestOtpMutation.mutate({ email: data.email });
  };

  const onSubmitPassword = (data: FormData) => {
    resetPasswordMutation.mutate({ password: data.password });
  };

  const resendOtp = () => {
    if (userEmail) {
      requestOtpMutation.mutate({ email: userEmail });
    }
  };

  return (
    <div className='w-full py-10 min-h-[85vh] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center'>
      <div className='max-w-md w-full mx-4 bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-[#0066CC] to-[#0047AB] p-6 text-center'>
          <h1 className='text-3xl font-bold text-white'>
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </h1>
          <p className='text-blue-100 mt-2'>
            {step === "email" && "Enter your email to reset your password"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "reset" && "Enter your new password"}
          </p>
        </div>
        
        <div className='p-8'>
          {step === "email" && (
            <>
              <form onSubmit={handleSubmit(onSubmitEmail)} className='space-y-5'>
                <div>
                  <label className='block text-gray-700 text-sm font-medium mb-2'>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    {...register('email', {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    placeholder='Enter your email'
                  />
                  {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className='w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#0066CC] transition-colors disabled:opacity-75'
                >
                  {requestOtpMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : 'Send OTP'}
                </button>

                {serverError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className='text-red-700 text-sm'>{serverError}</p>
                  </div>
                )}

                <div className="text-center text-sm text-gray-600 mt-6">
                  Go Back to?{' '} 
                  <Link href={'/login'} className='text-blue-600 hover:underline font-medium'>
                    Login
                  </Link>
                </div>
              </form>
            </>
          )}

          {step === "otp" && (
            <div className="text-center">
              <div className="mb-6">
                <p className='text-gray-600 mt-2'>We've sent a verification code to {userEmail}</p>
              </div>

              <div className='flex justify-center gap-3 mb-6'>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el
                    }}
                    maxLength={1}
                    className='w-14 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    value={digit}
                  />
                ))}
              </div>

              <button 
                onClick={() => verifyOtpMutation.mutate()} 
                disabled={verifyOtpMutation.isPending}
                className='w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#0066CC] transition-colors mb-4 disabled:opacity-75'
              >
                {verifyOtpMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify OTP'}
              </button>

              <div className="text-sm text-gray-600">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className='text-blue-600 hover:text-blue-800 font-medium'
                    disabled={requestOtpMutation.isPending}
                  >
                    {requestOtpMutation.isPending ? 'Resending...' : 'Resend OTP'}
                  </button>
                ) : (
                  <p>Resend OTP in {timer}s</p>
                )}
              </div>

              {serverError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
                  <p className='text-red-700 text-sm'>{serverError}</p>
                </div>
              )}
            </div>
          )}

          {step === "reset" && (
            <>
              <form onSubmit={handleSubmit(onSubmitPassword)} className='space-y-5'>
                <div>
                  <label className='block text-gray-700 text-sm font-medium mb-2'>
                    New Password
                  </label>
                  <input
                    type="password"
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    {...register('password', {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    placeholder='Enter your new password'
                  />
                  {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className='w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#0066CC] transition-colors disabled:opacity-75'
                >
                  {resetPasswordMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : 'Reset Password'}
                </button>

                {serverError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className='text-red-700 text-sm'>{serverError}</p>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword