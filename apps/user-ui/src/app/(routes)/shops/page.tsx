"use client";

import ShopCard from "@/shared/components/cards/shop-card";
import axiosInstance from "@/utils/axiosInstance";
import { countries } from "@/utils/countries";
import { categories } from "@/configs/categories";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiTag } from "react-icons/fi";

const Page = () => {
  const router = useRouter();
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    countries: true,
  });

  // Add useEffect to handle body scroll when filter is open
  useEffect(() => {
    if (isFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFiltersOpen]);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0)
      params.set("categories", selectedCategories.join(","));
    if (selectedCountries.length > 0)
      params.set("countries", selectedCountries.join(","));
    params.set("page", page.toString());
    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();

      if (selectedCategories.length > 0)
        query.set("categories", selectedCategories.join(","));
      if (selectedCountries.length > 0)
        query.set("countries", selectedCountries.join(","));

      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-shops?${query.toString()}`
      );
      setShops(res.data.shops);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch filtered shops", error);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [selectedCategories, selectedCountries, page]);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleCountry = (label: string) => {
    setSelectedCountries((prev) =>
      prev.includes(label)
        ? prev.filter((cou) => cou !== label)
        : [...prev, label]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="px-3 py-2 rounded border border-gray-200 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );
    
    // First page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setPage(1)}
          className="px-3 py-2 rounded border border-gray-200 text-sm"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 py-2">
            ...
          </span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-2 rounded border border-gray-200 text-sm ${
            page === i
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-black"
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 py-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="px-3 py-2 rounded border border-gray-200 text-sm"
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages}
        className="px-3 py-2 rounded border border-gray-200 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );
    
    return pages;
  };

  return (
    <div className="w-full bg-[#f5f5f5] min-h-screen">
      <div className="w-[90%] lg:w-[85%] m-auto">
        {/* Breadcrumb and title */}
        <div className="py-6 md:py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FiTag className="text-blue-600 text-xl" />
            </div>
            <h1 className="font-semibold text-3xl md:text-4xl lg:text-[44px] font-jost">
              All Shops
            </h1>
          </div>
          <div className="flex items-center text-sm text-[#55585b]">
            <Link href="/" className="hover:underline hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span className="inline-block w-1 h-1 mx-2 bg-[#a8acb0] rounded-full"></span>
            <span>All Shops</span>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiFilter size={18} />
            <span>Filters</span>
            {(selectedCategories.length > 0 || selectedCountries.length > 0) && (
              <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {selectedCategories.length + selectedCountries.length}
              </span>
            )}
          </button>
          
          {(selectedCategories.length > 0 || selectedCountries.length > 0) && (
            <button 
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Mobile filter backdrop */}
        {isFiltersOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsFiltersOpen(false)}
          />
        )}

        <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* sidebar */}
          <aside className={`w-full lg:w-80 bg-white p-5 rounded-lg shadow-sm h-fit lg:sticky top-4 fixed left-0 top-0 h-screen z-50 overflow-y-auto transform transition-transform duration-300 ${isFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:block`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <div className="flex items-center gap-2">
                {(selectedCategories.length > 0 || selectedCountries.length > 0) && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={() => setIsFiltersOpen(false)}
                  className="lg:hidden p-1 rounded-full hover:bg-gray-100"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Categories */}
              <div className="border-b border-gray-200 pb-6">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium mb-4"
                  onClick={() => toggleSection('categories')}
                >
                  <span>Categories</span>
                  {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                
                {expandedSections.categories && (
                  <ul className="space-y-3">
                    {categories?.map((category: any) => (
                      <li
                        key={category.value}
                        className="flex items-center justify-between"
                      >
                        <label className="flex items-center gap-3 text-gray-700 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.value)}
                            onChange={() => toggleCategory(category.value)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="group-hover:text-blue-600 transition-colors">{category.value}</span>
                        </label>
                        <span className="text-xs text-gray-400">({Math.floor(Math.random() * 100)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Countries */}
              <div className="pb-6">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium mb-4"
                  onClick={() => toggleSection('countries')}
                >
                  <span>Countries</span>
                  {expandedSections.countries ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                
                {expandedSections.countries && (
                  <ul className="space-y-3 max-h-60 overflow-y-auto">
                    {countries?.map((country: any) => (
                      <li
                        key={country}
                        className="flex items-center justify-between"
                      >
                        <label className="flex items-center gap-3 text-gray-700 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCountries.includes(country)}
                            onChange={() => toggleCountry(country)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="group-hover:text-blue-600 transition-colors">{country}</span>
                        </label>
                        <span className="text-xs text-gray-400">({Math.floor(Math.random() * 50)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>

          {/* shop grid */}
          <div className={`flex-1 ${isFiltersOpen ? 'lg:block hidden' : 'block'}`}>
            {/* Active filters */}
            {(selectedCategories.length > 0 || selectedCountries.length > 0) && (
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(category => (
                    <span key={category} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {category}
                      <button 
                        onClick={() => toggleCategory(category)}
                        className="ml-1.5 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                  
                  {selectedCountries.map(country => (
                    <span key={country} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {country}
                      <button 
                        onClick={() => toggleCountry(country)}
                        className="ml-1.5 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Results count and sort (placeholder) */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 text-sm">
                Showing {shops.length} of {shops.length * totalPages} shops
              </p>
              <div className="relative w-40 z-10">
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                  <option>Sort by: Newest</option>
                  <option>Sort by: Most Popular</option>
                  <option>Sort by: A to Z</option>
                  <option>Sort by: Z to A</option>
                </select>
              </div>
            </div>

            {/* Shops grid */}
            {isShopLoading ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-60 bg-gray-300"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiX size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search filters to find what you're looking for.</p>
                <button 
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 flex-wrap gap-2">
                {renderPagination()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;