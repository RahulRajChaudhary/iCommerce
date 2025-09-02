'use client'

import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { set, useForm } from 'react-hook-form';
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
    loginMutation.mutate(data);
  }

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-user`, data, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      router.push('/')
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid credentials!";
      setServerError(errorMessage);
    }
  });

  return (
    <div className='w-full py-10 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center'>
      <div className='max-w-md w-full mx-4 bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-[#0066CC] to-[#0047AB] p-6 text-center'>
          <h1 className='text-3xl font-bold text-white'>Welcome Back</h1>
          <p className='text-blue-100 mt-2'>Sign in to iCommerce</p>
        </div>
        
        <div className='p-8'>
         
          

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
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
                placeholder="Enter your password"
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
                className="absolute right-3 top-[50%] text-gray-500 hover:text-gray-700"
              >
                {passwordVisible ? <VscEye size={20} /> : <VscEyeClosed size={20} />}
              </button>
              {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="ml-2 text-sm">Remember me</span>
              </label>
              <Link href={"/forgot-password"} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
               disabled= {loginMutation.isPending}
              className='w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:bg-gradient-to-r hover:from-[#0047AB] hover:to-[#0066CC] transition-colors'
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>

            {serverError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className='text-red-700 text-sm'>{serverError}</p>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link href={'/signup'} className='text-blue-600 hover:underline font-medium'>
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login