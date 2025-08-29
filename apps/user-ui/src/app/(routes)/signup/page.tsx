'use client'
import GoogleButton from '@/shared/components/google-button';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { VscEyeClosed, VscEye } from 'react-icons/vsc'
import axios from 'axios'

type FormData = {
  name: string
  email: string
  password: string
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return interval;
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) throw new Error("User data not available");
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user`,
        {
          ...userData,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`, 
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    }
  });

  const onSubmit = async (data: FormData) => {
    signupMutation.mutate(data);
  }

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

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  return (
    <div className='w-full py-10 min-h-[85vh] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center'>
      <div className='max-w-md w-full mx-4 bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-[#0066CC] to-[#0047AB] p-6 text-center'>
          <h1 className='text-3xl font-bold text-white'>Create Account</h1>
          <p className='text-blue-100 mt-2'>Join iCommerce</p>
        </div>
        
        <div className='p-8'>
          {!showOtp ? (
            <>
              <GoogleButton />
              
              <div className='flex items-center justify-center text-gray-400 text-sm my-6'>
                <div className='flex-1 border-t border-gray-300' />
                <span className='px-3'>or sign up with email</span>
                <div className='flex-1 border-t border-gray-300' />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                <div>
                  <label className='block text-gray-700 text-sm font-medium mb-2'>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    {...register('name', {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters"
                      }
                    })}
                    placeholder='Enter your full name'
                  />
                  {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
                </div>

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

                <div className="relative">
                  <label className='block text-gray-700 text-sm font-medium mb-2'>
                    Password
                  </label>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                    placeholder="Create a password"
                    {...register("password", {
                      required: "Password is required",
                      pattern: {
                        value: /^(?=.*\S).{6,}$/,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                  >
                    {passwordVisible ? <VscEye size={20} /> : <VscEyeClosed size={20} />}
                  </button>
                  {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
                </div>

                <button 
                  type="submit" 
                  className='w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#0066CC] transition-colors disabled:opacity-75'
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : 'Create Account'}
                </button>

                <div className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{' '}
                  <Link href={'/login'} className='text-blue-600 hover:underline font-medium'>
                    Sign in
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <h3 className='text-2xl font-semibold text-gray-800'>Verify Your Email</h3>
                <p className='text-gray-600 mt-2'>We've sent a verification code to your email</p>
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
                  >
                    Resend OTP
                  </button>
                ) : (
                  <p>Resend OTP in {timer}s</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Signup