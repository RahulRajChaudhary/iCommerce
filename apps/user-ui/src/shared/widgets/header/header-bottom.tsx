"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import useUser from "@/hooks/useUser";
import { AlignLeft, ChevronDown, ChevronRight, X, Menu, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { useStore } from "@/store";
import { navItems } from "@/configs/constants";
import ProfileIcon from'@/assests/svgs/profile-icon'
import HeartIcon from "@/assests/svgs/heart-icon";
import CartIcon from "@/assests/svgs/cart-icon";

const HeaderBottom = ({ onOpenMenu, mobileMenuOpen, onCloseMenu }:{ onOpenMenu: () => void, mobileMenuOpen: boolean, onCloseMenu: () => void}) => {
  const [showCategories, setShowCategories] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const { user, isLoading } = useUser();
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Track scroll position for mobile sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      // For desktop
      if (window.innerWidth >= 768 && window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
      
      // For mobile sticky header
      if (window.innerWidth < 768) {
        if (window.scrollY > 50) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Mobile Search Bar - Sticky */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 transition-all duration-300">
        <div className={`p-3 ${isScrolled ? 'py-2' : 'py-3'}`}>
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search for products..."
              className="w-full px-4 font-Poppins font-medium border-2 border-[#3489FF] outline-none h-[45px] rounded-l-md"
            />
            <button
              onClick={handleSearchClick}
              className="w-[50px] cursor-pointer flex items-center justify-center h-[45px] bg-gradient-to-r from-[rgba(0,102,204,0.85)] to-[rgba(0,71,171,0.9)] absolute top-0 right-0 rounded-r-md"
            >
              <Search color="#fff" size={20} />
            </button>
          </div>
          
          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 max-h-[300px] overflow-y-auto rounded-md">
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
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-md z-50 px-4 py-3 text-sm text-gray-500 rounded-md">
              Searching...
            </div>
          )}
        </div>

        {/* Mobile Sticky Navigation Bar when scrolled */}
        {isScrolled && (
          <div className="bg-white border-t border-gray-200 p-2 flex items-center justify-between">
            <button
              onClick={onOpenMenu}
              className="p-2 text-gray-700 flex items-center gap-1"
            >
              <Menu size={20} />
              <span className="text-sm">Menu</span>
            </button>
            
            <div className="flex items-center gap-3">
              <Link href={"/wishlist"} className="relative text-gray-700 p-2">
                <HeartIcon size={20} />
                {wishlist?.length > 0 && (
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                    <span className="text-white text-xs font-medium">
                      {wishlist.length}
                    </span>
                  </div>
                )}
              </Link>
              
              <Link href={"/cart"} className="relative text-gray-700 p-2">
                <CartIcon size={20} />
                {cart?.length > 0 && (
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                    <span className="text-white text-xs font-medium">
                      {cart.length}
                    </span>
                  </div>
                )}
              </Link>
              
              <Link href={user ? "/profile" : "/login"} className="text-gray-700 p-2">
                <ProfileIcon size={20} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div 
        className={`w-full transition-all duration-300 hidden md:block ${
          isSticky
            ? "fixed top-0 left-0 z-[100] bg-white shadow-lg"
            : "shadow-sm relative"
        }`}
      >
        <div className="w-[90%] lg:w-[80%] m-auto flex items-center justify-between py-3">
          {/* All Departments - Desktop */}
          <div className="relative" ref={categoriesRef}>
            <div
              className="w-[260px] cursor-pointer flex items-center justify-between px-5 h-[50px] bg-gradient-to-r from-[rgba(0,102,204,0.85)] to-[rgba(0,71,171,0.9)] rounded-md"
              onClick={() => setShowCategories(!showCategories)}
            >
              <div className="flex items-center gap-2">
                <AlignLeft color="white" />
                <span className="text-white font-medium">All Departments</span>
              </div>
              <ChevronDown color="white" />
            </div>

            {showCategories && (
              <div className="absolute left-0 top-full w-[260px] max-h-[400px] overflow-y-auto bg-white shadow-lg z-[999] rounded-b-md mt-1">
                {data?.categories?.length > 0 ? (
                  data.categories.map((cat: string, i: number) => {
                    const hasSub = data.subCategories?.[cat]?.length > 0;
                    const isExpanded = expandedCategory === cat;

                    return (
                      <div key={i} className="relative">
                        <button
                          onClick={() => {
                            if (hasSub) {
                              setExpandedCategory((prev) =>
                                prev === cat ? null : cat
                              );
                            } else {
                              setShowCategories(false);
                              window.location.href = `/products?category=${encodeURIComponent(
                                cat
                              )}`;
                            }
                          }}
                          className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-100 transition"
                        >
                          <span>{cat}</span>
                          {hasSub &&
                            (isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            ))}
                        </button>

                        {/* Subcategories Panel */}
                        {isExpanded && hasSub && (
                          <div className="pl-4 bg-gray-50 border-t border-gray-200">
                            {data.subCategories[cat].map(
                              (sub: string, j: number) => (
                                <Link
                                  key={j}
                                  href={`/products?category=${encodeURIComponent(
                                    cat
                                  )}`}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                                  onClick={() => setShowCategories(false)}
                                >
                                  {sub}
                                </Link>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="px-5 py-4 text-sm text-gray-500">
                    No categories found.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links - Desktop */}
          <div className="flex items-center">
            {navItems.map((i: navItemsTypes, index: number) => (
              <Link
                className="px-4 font-medium text-gray-800 hover:text-blue-600 transition-colors"
                href={i.href}
                key={index}
              >
                {i.title}
              </Link>
            ))}
          </div>

          {/* Sticky Header Content - Only show user info when sticky */}
          {isSticky && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {!isLoading && user ? (
                  <div className="relative flex items-center gap-2">
                    <Link
                      href={"/profile"}
                      className="border-2 w-[40px] relative h-[40px] flex items-center justify-center rounded-full border-gray-200 hover:border-blue-500 transition-colors"
                    >
                      <ProfileIcon />
                    </Link>

                    <Link href={"/profile"} className="hidden lg:block">
                      <span className="block font-medium text-sm">Hello,</span>
                      <span className="font-semibold text-sm">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </Link>
                  </div>
                ) : (
                  <Link href={"/login"} className="flex items-center gap-2">
                    <div className="border-2 w-[40px] h-[40px] flex items-center justify-center rounded-full border-gray-200 hover:border-blue-500 transition-colors">
                      <ProfileIcon />
                    </div>
                    <div className="hidden lg:block">
                      <span className="block font-medium text-sm opacity-[.6]">
                        Hello,
                      </span>
                      <span className="font-semibold text-sm">
                        {isLoading ? "..." : "Sign In"}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
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
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="p-4 bg-gradient-to-r from-[rgba(0,102,204,0.85)] to-[rgba(0,71,171,0.9)] text-white flex justify-between items-center">
            <span className="font-bold">Menu</span>
            <button onClick={onCloseMenu}>
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto h-full">
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-gray-800">All Departments</h3>
              <div className="space-y-2">
                {data?.categories?.length > 0 ? (
                  data.categories.map((cat: string, i: number) => (
                    <div key={i} className="border-b border-gray-200 pb-2">
                      <button
                        onClick={() => {
                          if (expandedCategory === cat) {
                            setExpandedCategory(null);
                          } else {
                            setExpandedCategory(cat);
                          }
                        }}
                        className="w-full flex justify-between items-center py-2 text-gray-800"
                      >
                        <span>{cat}</span>
                        {data.subCategories?.[cat]?.length > 0 && (
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${expandedCategory === cat ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </button>
                      
                      {expandedCategory === cat && data.subCategories?.[cat]?.length > 0 && (
                        <div className="pl-4 mt-2 space-y-2">
                          {data.subCategories[cat].map((sub: string, j: number) => (
                            <Link
                              key={j}
                              href={`/products?category=${encodeURIComponent(cat)}`}
                              className="block py-1 text-gray-600"
                              onClick={onCloseMenu}
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No categories found.</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-gray-800">Navigation</h3>
              <div className="space-y-2">
                {navItems.map((item: navItemsTypes, index: number) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block py-2 text-gray-800 border-b border-gray-200"
                    onClick={onCloseMenu}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-gray-800">Account</h3>
              <div className="space-y-2">
                {!isLoading && user ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="border-2 w-[40px] h-[40px] flex items-center justify-center rounded-full border-gray-200">
                        <ProfileIcon />
                      </div>
                      <div>
                        <p className="font-medium">Hello, {user?.name?.split(" ")[0]}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="block py-2 text-gray-800 border-b border-gray-200"
                      onClick={onCloseMenu}
                    >
                      My Profile
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block py-2 text-gray-800 border-b border-gray-200"
                    onClick={onCloseMenu}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderBottom;