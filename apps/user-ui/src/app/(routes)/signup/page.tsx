
'use client'
import GoogleButton from '@/shared/components/google-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { VscEyeClosed, VscEye } from 'react-icons/vsc'


type FormData = {
  name: string
  email: string
  password: string
};

const Signup = () => {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);;
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    console.log(data);
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

  const handleResendOtp = () => {
    
  }

  return (
    <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>

      <div className='w-full flex justify-center'>
        <div className='md:w-[40%] w-[80%] p-8 bg-white shadow rounded-lg'>
          <h3 className='text-2xl font-Poppins font-semibold text-center mb-2'>Signup to iCommerce</h3>
          <p className='text-center text-lg font-medium py-3'>Already have an account?
            <Link href={'/login'} className='text-[#759bf3] cursor-pointer'>
              Login
            </Link>
          </p>
          <GoogleButton />
          <div className='flex items-center justify-center text-grey-400 text-sm my-5'>
            <div className='flex-1 border-t border-gray-300' />
            <span className='px-3'> or Sign in with Email</span>
            <div className='flex-1 border-t border-gray-300' />
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <label className='block text-grey-700 text-sm font-bold mb-2'>
                Name
              </label>
              <input
                type="text"
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200'
                {...register('name', {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                })}
                placeholder='Enter your name'
              />
              {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}

              <label className='block text-grey-700 text-sm font-bold mb-2'>
                Email
              </label>
              <input type="email"
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200' {...register('email', {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder='Enter your email' />
              {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}


              <div className="relative">
                <label className='block text-grey-700 text-sm font-bold mb-2'>
                  Password
                </label>
                <input
                  type={passwordVisible ? "text" : "password"} // <-- changed dynamic type
                  className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Password"
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
                  className="absolute right-3 top-1/2 transform translate-y-1/2 text-gray-600"
                >
                  {passwordVisible ? <VscEye /> : <VscEyeClosed />}
                </button>
                {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
              </div>

              <button type="submit" className='w-full p-2 bg-[#759bf3] text-white rounded-md hover:bg-[#759bf3] focus:outline-none focus:ring focus:ring-blue-200 mt-4'>
                Sign Up
              </button>

              {serverError && <p className='text-red-500 text-sm mt-1'>{serverError}</p>}

            </form>
          ) : (
            <div>
              <h3 className='text-2xl font-Poppins font-semibold text-center mb-2'>Enter OTP</h3>

              <div className='flex justify-center gap-6'>
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el
                    }}
                    maxLength={1}
                    className='w-12 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200'
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
                </div>

                <button type="submit" className='w-full p-2 bg-[#759bf3] text-white rounded-md hover:bg-[#759bf3] focus:outline-none focus:ring focus:ring-blue-200 mt-4'>
                  Verify
                </button>
                <p className='text-center text-sm font-medium pt-3'>
                  {canResend ? (
                    <button
                      onClick={handleResendOtp} 
                      className='text-[#759bf3] cursor-pointer'>
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s` 
                  )}
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Signup