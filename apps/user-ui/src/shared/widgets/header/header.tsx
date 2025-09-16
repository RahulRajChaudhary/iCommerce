"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { Search, X, Menu } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import ProfileIcon from'@/assests/svgs/profile-icon'
import HeartIcon from "@/assests/svgs/heart-icon";
import CartIcon from "@/assests/svgs/cart-icon";
import HeaderBottom from "./header-bottom";
import useUser from "@/hooks/useUser";
import Image from "next/image";
import { useStore } from "@/store/index";
import useLayout from "@/hooks/useLayout";

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const { layout } = useLayout();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleSearchClick = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSuggestions(true);
    try {
      const res = await axiosInstance.get(
        `/product/api/search-products?q=${encodeURIComponent(searchQuery)}`
      );
      setSuggestions(res.data.products.slice(0, 10));
    } catch (err) {
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-white shadow-sm">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="w-[90%] lg:w-[80%] py-4 m-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={"/"}>
              <Image
                src={
                  layout?.logo ||
                  "https://ik.imagekit.io/mu0woh4fs/iCommerce_Logo_Premium_Quality.png?updatedAt=1758000279389"
                }
                width={200}
                height={80}
                alt="Logo"
                className="h-[60px] w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Search Input - Desktop */}
          <div className="flex-1 max-w-[50%] mx-6 relative" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search for products..."
              className="w-full px-4 font-Poppins font-medium border-2 border-[#3489FF] outline-none h-[50px] rounded-l-md"
            />
            <button
              onClick={handleSearchClick}
              className="w-[60px] cursor-pointer flex items-center justify-center h-[50px] bg-gradient-to-r from-[rgba(0,102,204,0.85)] to-[rgba(0,71,171,0.9)] absolute top-0 right-0 rounded-r-md"
            >
              <Search color="#fff" size={22} />
            </button>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute w-full top-[55px] bg-white border border-gray-200 shadow-lg z-50 max-h-[300px] overflow-y-auto rounded-md">
                {suggestions.map((item) => (
                  <Link
                    href={`/product/${item.slug}`}
                    key={item.id}
                    onClick={() => {
                      setSuggestions([]);
                      setSearchQuery("");
                    }}
                    className="block px-4 py-3 text-sm hover:bg-blue-50 text-gray-800 border-b border-gray-100"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
            {loadingSuggestions && (
              <div className="absolute w-full top-[55px] bg-white border border-gray-200 shadow-md z-50 px-4 py-3 text-sm text-gray-500 rounded-md">
                Searching...
              </div>
            )}
          </div>

          {/* Profile & Icons - Desktop */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {!isLoading && user ? (
                <>
                  <div className="relative">
                    <Link
                      href={"/profile"}
                      className="border-2 w-[40px] h-[40px] flex items-center justify-center rounded-full border-gray-200 hover:border-blue-500 transition-colors"
                    >
                      <ProfileIcon />
                    </Link>
                  </div>
                  <Link href={"/profile"} className="hidden lg:block">
                    <span className="block font-medium text-sm">Hello,</span>
                    <span className="font-semibold text-sm">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={"/login"}
                    className="border-2 w-[40px] h-[40px] flex items-center justify-center rounded-full border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    <ProfileIcon />
                  </Link>
                  <Link href={"/login"} className="hidden lg:block">
                    <span className="block font-medium text-sm">Hello,</span>
                    <span className="font-semibold text-sm">
                      {isLoading ? "..." : "Sign In"}
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* Wishlist & Cart - Desktop */}
            <div className="flex items-center gap-4">
              <Link href={"/wishlist"} className="relative text-gray-700 hover:text-blue-600 transition-colors">
                <HeartIcon size={22} />
                {wishlist?.length > 0 && (
                  <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
                    <span className="text-white text-xs font-medium">
                      {wishlist.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href={"/cart"} className="relative text-gray-700 hover:text-blue-600 transition-colors">
                <CartIcon />
                {cart?.length > 0 && (
                  <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
                    <span className="text-white text-xs font-medium">
                      {cart.length}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-b border-b-[#99999938]" />
      </div>

      {/* Mobile Header - Unified for all mobile screens */}
      <div className="md:hidden bg-white">
        {/* Top Mobile Bar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-700"
            >
              <Menu size={24} />
            </button>
            
            <Link href={"/"} className="flex-shrink-0">
              <Image
                src={
                  layout?.logo ||
                  "https://ik.imagekit.io/mu0woh4fs/iCommerce_Logo_Premium_Quality.png?updatedAt=1758000279389"
                }
                width={120}
                height={50}
                alt="Logo"
                className="h-[40px] w-auto object-contain"
              />
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 text-gray-700"
            >
              <Search size={22} />
            </button>
            
            <Link href={"/wishlist"} className="relative text-gray-700">
              <HeartIcon size={22} />
              {wishlist?.length > 0 && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                  <span className="text-white text-xs font-medium">
                    {wishlist.length}
                  </span>
                </div>
              )}
            </Link>
            
            <Link href={"/cart"} className="relative text-gray-700">
              <CartIcon />
              {cart?.length > 0 && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                  <span className="text-white text-xs font-medium">
                    {cart.length}
                  </span>
                </div>
              )}
            </Link>
            
            <Link href={user ? "/profile" : "/login"} className="text-gray-700">
              <ProfileIcon />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white p-4">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setMobileSearchOpen(false)}>
              <X size={24} />
            </button>
            <h3 className="font-bold text-lg">Search</h3>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for products..."
              className="w-full px-4 font-Poppins font-medium border-2 border-[#3489FF] outline-none h-[50px] rounded-l-md"
              autoFocus
            />
            <button
              onClick={handleSearchClick}
              className="w-[60px] cursor-pointer flex items-center justify-center h-[50px] bg-gradient-to-r from-[rgba(0,102,204,0.85)] to-[rgba(0,71,171,0.9)] absolute top-0 right-0 rounded-r-md"
            >
              <Search color="#fff" size={22} />
            </button>
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 shadow-lg z-50 max-h-[300px] overflow-y-auto rounded-md">
              {suggestions.map((item) => (
                <Link
                  href={`/product/${item.slug}`}
                  key={item.id}
                  onClick={() => {
                    setSuggestions([]);
                    setSearchQuery("");
                    setMobileSearchOpen(false);
                  }}
                  className="block px-4 py-3 text-sm hover:bg-blue-50 text-gray-800 border-b border-gray-100"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
          {loadingSuggestions && (
            <div className="mt-2 bg-white border border-gray-200 shadow-md z-50 px-4 py-3 text-sm text-gray-500 rounded-md">
              Searching...
            </div>
          )}
        </div>
      )}

      <HeaderBottom 
        onOpenMenu={() => setMobileMenuOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMenu={() => setMobileMenuOpen(false)}
      />
    </div>
  );
};

export default Header;