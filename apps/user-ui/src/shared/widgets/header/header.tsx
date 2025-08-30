"use client"
import Link from 'next/link'
import React from 'react'
import HeaderBottom from './header-bottom'
import { CiHeart, CiSearch, CiShoppingCart } from "react-icons/ci";
import { FiUser } from "react-icons/fi";
import useUser from '@/hooks/useUser';

const Header = () => {
  const { user, isLoading } = useUser()
  return (
    <div className='w-full bg-gradient-to-r from-[#0066CC] to-[#0047AB] shadow-md'>
      <div className='w-[90%] max-w-7xl py-4 m-auto flex items-center justify-between'>
        {/* Logo */}
        <div>
          <Link href="/">
            <span className='text-2xl font-bold text-white'>iCommerce</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className='w-[50%] relative'>
          <input
            type='text'
            placeholder='Search products, categories, brands'
            className='w-full h-[46px] px-4 py-2 rounded-full font-Poppins font-medium border-2 border-white/20 bg-white/90 outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all' />
          <div className='w-[50px] cursor-pointer flex items-center justify-center h-[46px] bg-[#003366] hover:bg-[#002244] rounded-r-full absolute top-0 right-0 transition-colors'>
            <CiSearch color="white" size={20} />
          </div>
        </div>

        {/* User Actions */}
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-2'>
            {!isLoading && user? (
              <>
                <Link href={"/profile"}
                  className='border-2 border-white/30 w-[42px] h-[42px] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors'>
                  <FiUser className="text-white" />
                </Link>
                <div>
                  <Link href={"/profile"}>
                    <span className='block font-medium text-sm text-white/80'>Hello,</span>
                    <span className='font-semibold text-white'>{user?.name?.split(" ")[0]
                     }</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href={"/login"}
                  className='border-2 border-white/30 w-[42px] h-[42px] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors'>
                  <FiUser className="text-white" />
                </Link>
                <div>
                  <Link href={"/login"}>
                    <span className='block font-medium text-sm text-white/80'>Hello,</span>
                    <span className='font-semibold text-white'>{isLoading ? "Loading.." : "Sign In" }</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className='flex items-center gap-4'>
            <Link href={'/wishlist'}
              className='relative text-white p-2 hover:bg-white/10 rounded-full transition-colors'>
              <CiHeart size={26} />
              <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center absolute top-0 right-0'>
                <span className='text-white font-medium text-xs'>0</span>
              </div>
            </Link>
            <Link href={'/cart'}
              className='relative text-white p-2 hover:bg-white/10 rounded-full transition-colors'>
              <CiShoppingCart size={26} />
              <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center absolute top-0 right-0'>
                <span className='text-white font-medium text-xs'>9+</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <HeaderBottom />
    </div>
  )
}

export default Header