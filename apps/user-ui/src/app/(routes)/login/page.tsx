
'use client'
import GoogleButton from '@/shared/components/google-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { VscEyeClosed, VscEye } from 'react-icons/vsc'


type FormData = {
  email: string
  password: string
};

const Login = () => {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    console.log(data);
  }
  return (
    <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
      <h1 className='text-4xl font-Poppins font-semibold text-black text-center'>
        Login
      </h1>
      <p className='text-center text-lg font-medium py-3 text-black'>
        Home . Login
      </p>
      <div className='w-full flex justify-center'>
        <div className='md:w-[40%] w-[80%] p-8 bg-white shadow rounded-lg'>
          <h3 className='text-2xl font-Poppins font-semibold text-center mb-2'>Login to iCommerce</h3>
          <p className='text-center text-lg font-medium py-3'>Don't have an account?  <Link href={'/signup'} className='text-[#759bf3] cursor-pointer'>Sign Up</Link>
          </p>
          <GoogleButton />
          <div className='flex items-center justify-center text-grey-400 text-sm my-5'>
            <div className='flex-1 border-t border-gray-300' />
            <span className='px-3'> or Sign in with Email</span>
            <div className='flex-1 border-t border-gray-300' />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
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

            <div className="flex justify-between items-center my-4">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>
              <Link href={"/forgot-password"} className="text-[#759bf3] text-sm">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className='w-full p-2 bg-[#759bf3] text-white rounded-md hover:bg-[#759bf3] focus:outline-none focus:ring focus:ring-blue-200'>
              Login
            </button>

            {serverError && <p className='text-red-500 text-sm mt-1'>{serverError}</p>}

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login