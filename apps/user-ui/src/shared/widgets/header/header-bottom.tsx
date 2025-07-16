'use client'

import React, { useEffect, useState } from 'react'

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
  } , [])
  return (
    <div className={`w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-100 bg-white shadow-lg' : 'relative'}`}>
      <div className={`w-[80%] m-auto flex items-center justify-between ${isSticky ? 'pt-3' : 'py-0'}`}>
      
        {/* drop down till 4.32 */}
        <div className={`w`}>

        </div>
      </div>
    </div>
  )
}

export default HeaderBottom