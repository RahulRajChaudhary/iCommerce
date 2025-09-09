import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Ratings from "../ratings";
import { Heart, MapPin, X, Minus, Plus, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import CartIcon from "@/assests/svgs/cart-icon";
import { useStore } from "@/store/index";
import useUser from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const addToCart = useStore ((state: any) => state.addToCart);
  const cart = useStore ((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === data.id);
  const addToWishlist = useStore ((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore ((state: any) => state.removeFromWishlist);
  const wishlist = useStore ((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === data.id);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const router = useRouter();

  const handleChat = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);

    try {
      const res = await axiosInstance.post(
        "/chatting/api/create-user-conversationGroup",
        { sellerId: data?.Shop?.sellerId },
        isProtected
      );
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right Corner */}
        <button
          onClick={() => setOpen(false)}
          className="absolute left-4 top-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
          aria-label="Close product details"
        >
          <X size={24} className="text-gray-600" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Gallery Section */}
          <div className="w-full md:w-1/2 p-4 md:p-6">
            <div className="relative h-80 md:h-96 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src={data?.images?.[activeImage]?.url}
                alt={data?.title || "Product image"}
                width={500}
                height={500}
                className="w-full h-full object-contain transition-opacity duration-300"
              />
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3 mt-4 pb-2 overflow-x-auto">
              {data?.images?.map((img: any, index: number) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                    activeImage === index
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={img?.url}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="w-full md:w-1/2 p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-100">
            {/* Seller Info with Chat Button */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <Image
                    src={data?.Shop?.avatar}
                    alt={data?.Shop?.name || "Shop logo"}
                    width={48}
                    height={48}
                    className="rounded-full w-12 h-12 object-cover border-2 border-gray-100"
                  />
                </div>
                <div>
                  <Link
                    href={`/shop/${data?.Shop?.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {data?.Shop?.name}
                  </Link>
                  <div className="mt-1">
                    <Ratings rating={data?.Shop?.ratings} />
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleChat()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <MessageCircle size={18} />
                {isLoading ? "Connecting..." : "Chat"}
              </button>
            </div>

            {/* Shop Location */}
            <div className="py-3 border-b border-gray-200">
              <p className="text-gray-600 flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-gray-500" />
                {data?.Shop?.address || "Location Not Available"}
              </p>
            </div>

            {/* Product Title and Description */}
            <div className="py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">{data?.title}</h1>
              <p className="mt-2 text-gray-700 leading-relaxed">
                {data?.short_description}
              </p>
              
              {data?.brand && (
                <p className="mt-3 text-gray-600">
                  <span className="font-medium">Brand:</span> {data.brand}
                </p>
              )}
            </div>

            {/* Color & Size Selection */}
            <div className="py-4 border-b border-gray-200">
              <div className="flex flex-col gap-4">
                {data?.colors?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.colors.map((color: string, index: number) => (
                        <button
                          key={index}
                          className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                            isSelected === color
                              ? "border-gray-800 scale-110 shadow-md"
                              : "border-gray-300 hover:border-gray-500"
                          }`}
                          onClick={() => setIsSelected(color)}
                          aria-label={`Select color: ${color}`}
                          style={{ backgroundColor: color }}
                        >
                          {isSelected === color && (
                            <div className="w-4 h-4 bg-white/80 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {data?.sizes?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.sizes.map((size: string, index: number) => (
                        <button
                          key={index}
                          className={`px-4 py-2 rounded-md border transition-all duration-200 ${
                            isSizeSelected === size
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                          }`}
                          onClick={() => setIsSizeSelected(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price and Quantity Section */}
            <div className="py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-900">
                  ${data?.sale_price}
                </span>
                {data?.regular_price && (
                  <span className="text-lg text-gray-500 line-through">
                    ${data.regular_price}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 bg-white min-w-[3rem] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {/* Add to Cart Button */}
                <button
                  disabled={isInCart}
                  onClick={() =>
                    addToCart(
                      {
                        ...data,
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
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                    isInCart
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  <CartIcon size={18} />
                  {isInCart ? "Added to Cart" : "Add to Cart"}
                </button>
                
                {/* Wishlist Button */}
                <button
                  className={`p-3 rounded-full border transition-colors duration-200 ${
                    isWishlisted
                      ? "bg-red-50 border-red-100 text-red-500"
                      : "bg-white border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
                  }`}
                  onClick={() =>
                    isWishlisted
                      ? removeFromWishlist(data.id, user, location, )
                      : addToWishlist(
                          {
                            ...data,
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
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    size={22}
                    fill={isWishlisted ? "currentColor" : "none"}
                    color="currentColor"
                  />
                </button>
              </div>
            </div>

            {/* Stock Status and Delivery Info */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {data.stock > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Estimated Delivery: <strong>{estimatedDelivery.toDateString()}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;