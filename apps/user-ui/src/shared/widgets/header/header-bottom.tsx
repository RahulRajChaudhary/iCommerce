'use client'

import { navItems } from '@/configs/constants'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { CiTextAlignLeft } from 'react-icons/ci'
import { CiHeart,CiShoppingCart } from "react-icons/ci";
import { FiUser } from "react-icons/fi";
import { IoChevronDownOutline } from "react-icons/io5";

const HeaderBottom = () => {
  const [show, setShow] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  // tracks current scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  return (
    <div
      className={`w-full transition-all duration-300 bg-white  ${isSticky
        ? "fixed top-0 left-0 z-[100] bg-white shadow-lg"
        : " relative"
        }`}
    >
      <div
        className={`w-[80%] relative m-auto md:flex hidden items-center justify-between ${isSticky ? "pt-2 pb-2" : "py-0"
          }`}
      >
        {/* All Dropdowns */}
        <div
          className={`w-[260px] ${isSticky && "-mb-2"
            } cursor-pointer flex items-center justify-between px-5 h-[50px] `}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <CiTextAlignLeft color="black" />
            <span className="text-black font-medium">All Departments</span>
          </div>
          <IoChevronDownOutline color="black" />
        </div>

        {/* dropdowns  menu */}

        {show && (
          <div
            className={`absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px]"
              } w-[260px] max-h-[400px] bg-white shadow-lg z-[999] `}
          >
          </div>
        )}
        <div className='flex items-center'>
          {navItems.map((item: navItems, index: number) => (
            <div key={index}>
              <Link
                className="px-5 font-medium text-md"
                key={index}
                href={item.href}>
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div>
          {isSticky && (
            <div className='flex items-center gap-8'>
              <div className='flex items-center gap-2'>
                <Link href={"/login"}
                  className='border-2 w-[40px] h-[40px] rounded-full flex items-center justify-center'>
                  <FiUser />
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
                  <CiHeart size={25} />
                  <div className='w-5 h-5 bg-red-600 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                    <span className='text-white font-medium text-sm'>0</span>
                  </div>
                </Link>
                <Link href={'/cart'}
                  className='relative'>
                  <CiShoppingCart size={25} />
                  <div className='w-5 h-5 bg-red-600 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                    <span className='text-white font-medium text-sm'>9+</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeaderBottom