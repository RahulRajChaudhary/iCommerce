"use client";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  WalletMinimal,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ReactImageMagnify from "react-image-magnify";
import Ratings from "../../components/ratings";
import Link from "next/link";
import { useStore } from "@/store/index";
import CartIcon from "@/assests/svgs/cart-icon";
import useUser from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import ProductCard from "../../components/cards/product-card";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useRouter } from "next/navigation";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const { user, isLoading } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const router = useRouter();

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelected, setIsSelected] = useState(
    productDetails?.colors?.[0] || ""
  );
  const [isSizeSelected, setIsSizeSelected] = useState(
    productDetails?.sizes?.[0] || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([
    productDetails?.sale_price,
    1199,
  ]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isSellerSectionExpanded, setIsSellerSectionExpanded] = useState(false);

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === productDetails.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some(
    (item: any) => item.id === productDetails.id
  );

  // Navigate to Previous Image
  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(productDetails?.images[currentIndex - 1]);
    }
  };

  // Navigate to Next Image
  const nextImage = () => {
    if (currentIndex < productDetails?.images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(productDetails?.images[currentIndex + 1]);
    }
  };

  const discountPercentage = Math.round(
    ((productDetails.regular_price - productDetails.sale_price) /
      productDetails.regular_price) *
      100
  );

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();

      query.set("priceRange", priceRange.join(","));
      query.set("page", "1");
      query.set("limit", "5");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`
      );
      setRecommendedProducts(res.data.products);
    } catch (error) {
      console.error("Failed to fetch filtered products", error);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [priceRange]);

  const handleChat = async () => {
    if (isChatLoading) {
      return;
    }
    setIsChatLoading(true);

    try {
      const res = await axiosInstance.post(
        "/chatting/api/create-user-conversationGroup",
        { sellerId: productDetails?.Shop?.sellerId },
        isProtected
      );
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[35%_1fr_300px] gap-6 overflow-hidden">
        {/* left column - product images */}
        <div className="p-4">
          <div className="relative w-full">
            {/* Main Image with zoom */}
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: "product Image",
                  isFluidWidth: true,
                  src:
                    currentImage ||
                    "https://ik.imagekit.io/mu0woh4fs/hero-section.png?updatedAt=1757339713543",
                },
                largeImage: {
                  src:
                    currentImage ||
                    "https://ik.imagekit.io/mu0woh4fs/hero-section.png?updatedAt=1757339713543",
                  width: 1200,
                  height: 1200,
                },
                enlargedImageContainerDimensions: {
                  width: "150%",
                  height: "150%",
                },
                enlargedImageStyle: {
                  border: "none",
                  boxShadow: "none",
                },
                enlargedImagePosition: "right",
              }}
            />
          </div>
          {/* Thumbnail images array */}
          <div className="relative flex items-center gap-2 mt04 overflow-hidden">
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex gap-2 overflow-x-auto">
              {productDetails?.images?.map((img: any, index: number) => (
                <Image
                  key={index}
                  src={
                    img?.url ||
                    "https://ik.imagekit.io/mu0woh4fs/hero-section.png?updatedAt=1757339713543"
                  }
                  alt="Thumbnail"
                  width={60}
                  height={60}
                  className={`cursor-pointer border rounded-lg p-1 ${
                    currentImage === img ? "border-blue-500" : "border-gray-300"
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentImage(img);
                  }}
                />
              ))}
            </div>
            {productDetails?.images.length > 4 && (
              <button
                className="absolute right-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
                disabled={currentIndex === productDetails?.images.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Middle column - product details */}
        <div className="p-4">
          <h1 className="text-2xl mb-2 font-bold text-gray-900">{productDetails?.title}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings rating={productDetails?.rating} />
              <Link href={"#reviews"} className="text-blue-500 hover:underline text-sm">
                (0 Reviews)
              </Link>
            </div>

            <div>
              <Heart
                size={25}
                fill={isWishlisted ? "red" : "transparent"}
                className="cursor-pointer"
                color={isWishlisted ? "transparent" : "#777"}
                onClick={() =>
                  isWishlisted
                    ? removeFromWishlist(
                        productDetails.id,
                        user,
                        location,
                        deviceInfo
                      )
                    : addToWishlist(
                        {
                          ...productDetails,
                          quantity,
                          selectedOptions: {
                            color: isSelected,
                            size: isSizeSelected,
                          },
                        },
                        user,
                        location,
                        deviceInfo
                      )
                }
              />
            </div>
          </div>

          <div className="py-2 border-b border-gray-200">
            <span className="text-gray-500 text-sm">
              Brand:{" "}
              <span className="text-blue-500 font-medium">
                {productDetails?.brand || "No Brand"}
              </span>
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ${productDetails?.sale_price}
              </span>
              {productDetails?.regular_price > productDetails?.sale_price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${productDetails?.regular_price}
                  </span>
                  <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <div className="flex flex-col md:flex-row items-start gap-5">
                {/* Color Options */}
                {productDetails?.colors?.length > 0 && (
                  <div>
                    <strong className="text-gray-700">Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.colors?.map(
                        (color: string, index: number) => (
                          <button
                            key={index}
                            className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                              isSelected === color
                                ? "border-gray-400 scale-110 shadow-md"
                                : "border-transparent"
                            }`}
                            onClick={() => setIsSelected(color)}
                            style={{ backgroundColor: color }}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Size Options */}
                {productDetails?.sizes?.length > 0 && (
                  <div>
                    <strong className="text-gray-700">Size:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails.sizes.map(
                        (size: string, index: number) => (
                          <button
                            key={index}
                            className={`px-3 py-1 cursor-pointer rounded-md transition ${
                              isSizeSelected === size
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                            onClick={() => setIsSizeSelected(size)}
                          >
                            {size}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md border border-gray-300 overflow-hidden">
                  <button
                    className="px-3 cursor-pointer py-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 bg-white py-1 min-w-[2.5rem] text-center">{quantity}</span>
                  <button
                    className="px-3 py-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-semibold"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>
                {productDetails?.stock > 0 ? (
                  <span className="text-green-600 font-semibold text-sm">
                    In Stock{" "}
                    <span className="text-gray-500 font-medium">
                      ({productDetails?.stock} available)
                    </span>
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold text-sm">
                    Out of Stock
                  </span>
                )}
              </div>

              <button
                className={`flex mt-6 items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition ${
                  isInCart ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                }`}
                disabled={isInCart || productDetails?.stock === 0}
                onClick={() =>
                  addToCart(
                    {
                      ...productDetails,
                      quantity,
                      selectedOptions: {
                        color: isSelected,
                        size: isSizeSelected,
                      },
                    },
                    user,
                    location,
                    deviceInfo
                  )
                }
              >
                <CartIcon size={18} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* right column - seller information - Fixed layout */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-fit sticky top-6 w-full max-w-full overflow-hidden">
          {/* Delivery Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Delivery to</span>
              <MapPin size={16} className="text-blue-600" />
            </div>
            <div className="text-sm text-gray-900 font-medium truncate">
              {location?.city || "City"}, {location?.country || "Country"}
            </div>
            <button className="text-blue-600 text-xs mt-1 hover:underline">
              Change location
            </button>
          </div>

          {/* Delivery Options */}
          <div className="mb-4 pb-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700 block mb-2">Delivery options</span>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-800">Standard Delivery</span>
              <span className="text-sm font-semibold text-green-600">Free</span>
            </div>
            <div className="text-xs text-gray-500">Estimated: 3-5 business days</div>
          </div>

          {/* Seller Info - Compact */}
          <div className="mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Sold by</span>
              <button 
                onClick={() => setIsSellerSectionExpanded(!isSellerSectionExpanded)}
                className="text-blue-600 text-xs flex items-center"
              >
                {isSellerSectionExpanded ? (
                  <>
                    Less <ChevronUp size={14} className="ml-1" />
                  </>
                ) : (
                  <>
                    More <ChevronDown size={14} className="ml-1" />
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                {productDetails?.Shop?.name}
              </span>
              <div className="flex items-center">
                <Star size={14} className="text-yellow-400 fill-current mr-1" />
                <span className="text-xs text-gray-700">4.8 (125)</span>
              </div>
            </div>
            
            <button
              onClick={() => handleChat()}
              disabled={isChatLoading}
              className="flex items-center justify-center gap-1 text-blue-600 text-sm mt-2 w-full py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              <MessageSquareText size={14} />
              {isChatLoading ? "Connecting..." : "Chat Now"}
            </button>
            
            {/* Expanded Seller Info */}
            {isSellerSectionExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">88%</div>
                    <div className="text-xs text-gray-500 mt-1">Positive Ratings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">100%</div>
                    <div className="text-xs text-gray-500 mt-1">Ship on Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">100%</div>
                    <div className="text-xs text-gray-500 mt-1">Response Rate</div>
                  </div>
                </div>
                
                <Link
                  href={`/shop/${productDetails?.Shop.id}`}
                  className="block text-center text-sm text-blue-600 font-medium hover:underline"
                >
                  Visit Store
                </Link>
              </div>
            )}
          </div>

          {/* Return & Warranty */}
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Benefits</span>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Package size={14} className="mr-2 text-blue-600" />
                <span>7 Days Returns</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <WalletMinimal size={14} className="mr-2 text-blue-600" />
                <span>Warranty not available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto mt-5">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Product details of {productDetails?.title}
          </h3>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailed_description,
            }}
          />
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto mt-5">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Ratings & Reviews of {productDetails?.title}
          </h3>
          <div className="text-center py-10 text-gray-500">
            <Star size={40} className="mx-auto text-gray-300 mb-3" />
            <p>No reviews available yet!</p>
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Be the first to review
            </button>
          </div>
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto mt-5 mb-8">
        <div className="w-full h-full p-5">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">You may also like</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recommendedProducts?.map((i: any) => (
              <ProductCard key={i.id} product={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;