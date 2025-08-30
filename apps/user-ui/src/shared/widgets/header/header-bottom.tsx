'use client'

import { navItems } from '@/configs/constants'
import useUser from '@/hooks/useUser'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { CiHeart, CiShoppingCart, CiTextAlignLeft } from 'react-icons/ci'
import { FiUser } from 'react-icons/fi'
import { IoChevronDownOutline } from 'react-icons/io5'

const HeaderBottom = () => {
  const [show, setShow] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const { user, isLoading } = useUser();
  console.log(user);

  // Mock data for demonstration
  const categories = [
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Beauty & Health",
    "Sports & Outdoors",
  ]

  const subCategories: Record<string, string[]> = {
    "Electronics": ["Mobiles", "Laptops", "Cameras", "TVs"],
    "Fashion": ["Men", "Women", "Kids", "Accessories"],
    "Home & Kitchen": ["Furniture", "Decor", "Kitchenware", "Appliances"],
    "Beauty & Health": ["Skincare", "Makeup", "Haircare", "Fragrances"],
    "Sports & Outdoors": ["Fitness", "Outdoor Gear", "Sports Equipment", "Cycling"],
  }

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`w-full transition-all duration-300 ${isSticky
        ? "fixed top-0 left-0 z-[100] bg-white shadow-lg"
        : "relative bg-white border-t border-gray-100"
        }`}
    >
      <div
        className={`w-[90%] max-w-7xl relative m-auto md:flex hidden items-center justify-between ${isSticky ? "py-3" : "py-2"
          }`}
      >
        {/* All Departments Dropdown */}
        <div
          className="w-[260px] cursor-pointer flex items-center justify-between px-5 h-[50px] text-black"
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <CiTextAlignLeft size={20} />
            <span className="font-medium">All Departments</span>
          </div>
          <IoChevronDownOutline />
        </div>

        {/* Dropdown Menu */}
        {show && (
          <div
            className={`absolute left-0 ${isSticky ? "top-[68px]" : "top-[50px]"
              } w-[260px] max-h-[400px] overflow-y-auto bg-white shadow-lg z-[999] rounded-md border border-gray-200`}
          >
            {categories.length > 0 ? (
              categories.map((cat, i) => {
                const hasSub = subCategories[cat]?.length > 0
                const isExpanded = expandedCategory === cat

                return (
                  <div key={i} className="relative">
                    <button
                      onClick={() => {
                        if (hasSub) {
                          setExpandedCategory(prev => (prev === cat ? null : cat))
                        } else {
                          setShow(false)
                        }
                      }}
                      className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-100 transition"
                    >
                      <span>{cat}</span>
                      {hasSub && (
                        <IoChevronDownOutline
                          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''
                            }`}
                        />
                      )}
                    </button>

                    {/* Subcategories Panel */}
                    {isExpanded && hasSub && (
                      <div className="pl-4 bg-gray-50 border-t border-gray-200">
                        {subCategories[cat].map((sub, j) => (
                          <Link
                            key={j}
                            href={`/products?category=${encodeURIComponent(cat)}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                            onClick={() => setShow(false)}
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="px-5 py-4 text-sm text-gray-500">
                No categories found.
              </p>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex items-center">
          {navItems.map((item: any, index: number) => (
            <div key={index}>
              <Link
                className="px-4 font-medium text-gray-800 hover:text-blue-600 transition-colors"
                href={item.href}
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>
        <div>
          {isSticky && (
            <div className='flex items-center gap-6'>
              <div className='flex items-center gap-2'>
                {!isLoading && user ? (
                  <>
                    <Link href={"/profile"}
                      className='border-2 border-black/30 w-[42px] h-[42px] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors'>
                      <FiUser className="text-black hover:text-blue-600" />
                    </Link>
                    <div>
                      <Link href={"/profile"}>
                        <span className='block font-medium text-sm  text-black hover:text-blue-600 transition-colors'>Hello,</span>
                        <span className='font-semibold text-black hover:text-blue-600 transition-colors'>{user?.name?.split(" ")[0]
                        }</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href={"/login"}
                      className='border-2 border-grey/30 w-[42px] h-[42px] rounded-full flex items-center justify-center hover:text-blue-600 transition-colors'>
                      <FiUser className="text-black" />
                    </Link>
                    <div>
                      <Link href={"/login"}>
                        <span className='block font-medium text-sm text-black/80'>Hello,</span>
                        <span className='font-semibold text-black/80'>{isLoading ? "Loading.." : "Sign In"}</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <div className='flex items-center gap-4'>
                <Link href={'/wishlist'}
                  className='relative text-black p-2 hover:text-blue-600 transition-colors rounded-full'>
                  <CiHeart size={26} />
                  <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center absolute top-0 right-0'>
                    <span className='text-white font-medium text-xs'>0</span>
                  </div>
                </Link>
                <Link href={'/cart'}
                  className='relative text-black p-2 hover:text-blue-600 transition-colors rounded-full'>
                  <CiShoppingCart size={26} />
                  <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center absolute top-0 right-0'>
                    <span className='text-white font-medium text-xs'>9+</span>
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