
'use client'
import GoogleButton from '@/shared/components/google-button';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';


type FormData = {
  email: string
  password: string
};

const Login = () => {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

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
          <p className='text-center text-lg font-medium py-3'>Don't have an account? <span className='text-[#759bf3] cursor-pointer'>Sign Up</span>
          </p>
          <GoogleButton />
          <div className='flex items-center justify-center text-grey-400 text-sm my-5'>
            <div className='flex-1 border-t border-gray-300' />
            <span className='px-3'> or Sign in with Email</span>
            <div className='flex-1 border-t border-gray-300' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login