
"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/shared/components/cards/product-card";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Range } from "react-range";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiTag } from "react-icons/fi";

const MIN = 0;
const MAX = 1199;

const Page = () => {
  const router = useRouter();
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    colors: true,
    sizes: true,
    price: true
  });

  const colors = [
    { name: "Black", code: "#000" },
    { name: "Red", code: "#ff0000" },
    { name: "Green", code: "#00ff00" },
    { name: "Blue", code: "#0000ff" },
    { name: "Yellow", code: "#ffff00" },
    { name: "Magenta", code: "#ff00ff" },
    { name: "Cyan", code: "#00ffff" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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
    params.set("priceRange", priceRange.join(","));
    if (selectedCategories.length > 0)
      params.set("categories", selectedCategories.join(","));
    if (selectedColors.length > 0)
      params.set("colors", selectedColors.join(","));
    if (selectedSizes.length > 0) params.set("sizes", selectedSizes.join(","));
    params.set("page", page.toString());
    router.replace(`/offers?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    try {
      const query = new URLSearchParams();

      query.set("priceRange", priceRange.join(","));
      if (selectedCategories.length > 0)
        query.set("categories", selectedCategories.join(","));
      if (selectedColors.length > 0)
        query.set("colors", selectedColors.join(","));
      if (selectedSizes?.length > 0)
        query.set("sizes", selectedSizes.join(","));
      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-offers?${query.toString()}`
      );
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch filtered offers", error);
    } finally {
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedColors, selectedSizes, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const clearAllFilters = () => {
    setPriceRange([0, 1199]);
    setTempPriceRange([0, 1199]);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
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
              Special Offers
            </h1>
          </div>
          <div className="flex items-center text-sm text-[#55585b]">
            <Link href="/" className="hover:underline hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span className="inline-block w-1 h-1 mx-2 bg-[#a8acb0] rounded-full"></span>
            <span>Special Offers</span>
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
            {(selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || (priceRange[0] !== MIN || priceRange[1] !== MAX)) && (
              <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {selectedCategories.length + selectedSizes.length + selectedColors.length + (priceRange[0] !== MIN || priceRange[1] !== MAX ? 1 : 0)}
              </span>
            )}
          </button>
          
          {(selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0) && (
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
                {(selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0) && (
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
              {/* Price Filter */}
              <div className="border-b border-gray-200 pb-6">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium mb-4"
                  onClick={() => toggleSection('price')}
                >
                  <span>Price Range</span>
                  {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                
                {expandedSections.price && (
                  <div className="pl-1">
                    <Range
                      step={1}
                      min={MIN}
                      max={MAX}
                      values={tempPriceRange}
                      onChange={(values) => setTempPriceRange(values)}
                      renderTrack={({ props, children }) => {
                        const [min, max] = tempPriceRange;
                        const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                        const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                        return (
                          <div
                            {...props}
                            className="h-1.5 bg-gray-200 rounded-full relative"
                            style={{ ...props.style }}
                          >
                            <div
                              className="absolute h-full bg-blue-600 rounded-full"
                              style={{
                                left: `${percentageLeft}%`,
                                width: `${percentageRight - percentageLeft}%`,
                              }}
                            />
                            {children}
                          </div>
                        );
                      }}
                      renderThumb={({ props }) => {
                        const { key, ...rest } = props;
                        return (
                          <div
                            key={key}
                            {...rest}
                            className="w-5 h-5 bg-white border border-blue-600 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        );
                      }}
                    />
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                      <span>${tempPriceRange[0]}</span>
                      <span>${tempPriceRange[1]}</span>
                    </div>
                    <button
                      onClick={() => {
                        setPriceRange(tempPriceRange);
                        setPage(1);
                      }}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Apply Price Filter
                    </button>
                  </div>
                )}
              </div>

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
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <li key={index} className="h-6 bg-gray-200 animate-pulse rounded"></li>
                      ))
                    ) : (
                      data?.categories?.map((category: any) => (
                        <li
                          key={category}
                          className="flex items-center justify-between"
                        >
                          <label className="flex items-center gap-3 text-gray-700 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="group-hover:text-blue-600 transition-colors">{category}</span>
                          </label>
                          <span className="text-xs text-gray-400">({Math.floor(Math.random() * 100)})</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {/* Colors */}
              <div className="border-b border-gray-200 pb-6">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium mb-4"
                  onClick={() => toggleSection('colors')}
                >
                  <span>Colors</span>
                  {expandedSections.colors ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                
                {expandedSections.colors && (
                  <ul className="space-y-3">
                    {colors.map((color) => (
                      <li
                        key={color.name}
                        className="flex items-center justify-between"
                      >
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedColors.includes(color.name)}
                            onChange={() => toggleColor(color.name)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                              style={{ backgroundColor: color.code }}
                            ></span>
                            <span className="group-hover:text-blue-600 transition-colors">{color.name}</span>
                          </div>
                        </label>
                        <span className="text-xs text-gray-400">({Math.floor(Math.random() * 50)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Sizes */}
              <div className="pb-6">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium mb-4"
                  onClick={() => toggleSection('sizes')}
                >
                  <span>Sizes</span>
                  {expandedSections.sizes ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                
                {expandedSections.sizes && (
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <label 
                        key={size} 
                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedSizes.includes(size) 
                            ? 'border-blue-600 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size)}
                          onChange={() => toggleSize(size)}
                          className="hidden"
                        />
                        <span className="font-medium">{size}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* product grid */}
          <div className={`flex-1 ${isFiltersOpen ? 'lg:block hidden' : 'block'}`}>
            {/* Active filters */}
            {(selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || (priceRange[0] !== MIN || priceRange[1] !== MAX)) && (
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-wrap gap-2">
                  {priceRange[0] !== MIN || priceRange[1] !== MAX ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Price: ${priceRange[0]} - ${priceRange[1]}
                      <button 
                        onClick={() => {
                          setPriceRange([MIN, MAX]);
                          setTempPriceRange([MIN, MAX]);
                        }}
                        className="ml-1.5 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ) : null}
                  
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
                  
                  {selectedColors.map(color => (
                    <span key={color} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {color}
                      <button 
                        onClick={() => toggleColor(color)}
                        className="ml-1.5 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                  
                  {selectedSizes.map(size => (
                    <span key={size} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {size}
                      <button 
                        onClick={() => toggleSize(size)}
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
                Showing {products.length} of {products.length * totalPages} offers
              </p>
              <div className="relative w-40 z-10">
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                  <option>Sort by: Newest</option>
                  <option>Sort by: Price Low to High</option>
                  <option>Sort by: Price High to Low</option>
                  <option>Sort by: Most Popular</option>
                </select>
              </div>
            </div>

            {/* Products grid */}
            {isProductLoading ? (
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
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product}  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiX size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
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