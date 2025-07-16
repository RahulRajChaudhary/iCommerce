
import Link from 'next/link'
import React from 'react'
import { HeartIcon, Search, ShoppingCart, User } from 'lucide-react'
import HeaderBottom from './header-bottom'
// import ProfileIcon  from '../../../assets/svgs/profile-icon.svg'

const Header = () => {
  return (
    <div className='w-full bg-gradient-to-r from-[#C9EDFF] to-[#A0BCFF]'>
      <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
        <div>
          <Link href="/">
            <span className='text-2xl font-[600]'>iCommerce</span>
          </Link>
        </div>
        <div className='w-[50%] relative'>
          <input
            type='text'
            placeholder='Search products, categories, brands'
            className='w-full h-[50px] px-4 py-2 rounded-md font-Poppins font-medium border-[2.5] border-[#A0BCFF] outline-none' />
          <div className='w-[60px] cursor-pointer flex items-center justify-center h-[50px] bg-[#759bf3] absolute top-0 right-0'>
            <Search color="white" />
          </div>
        </div>

        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-2'>
            <Link href={"/login"}
              className='border-2 w-[45px] h-[45px] rounded-full flex items-center justify-center'>
              <User />
            </Link>
            <div>
              <Link href={"/login"}>
                <span className='block font-medium'>Hello,</span>
                <span className='font-semibold'>Sign In</span>
              </Link>
            </div>
          </div>
          <div className='flex items-center gap-5'>
            <Link href={'/wishlist'}
              className='relative'>
              <HeartIcon />
              <div className='w-5 h-5 bg-red-600 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                <span className='text-white font-medium text-sm'>0</span>
              </div>
            </Link>
            <Link href={'/cart'}
              className='relative'>
              <ShoppingCart />
              <div className='w-5 h-5 bg-red-600 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                <span className='text-white font-medium text-sm'>9+</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className='border-b border-slate-200 '>
       <HeaderBottom />
      </div>
    </div>
  )
}

export default Header