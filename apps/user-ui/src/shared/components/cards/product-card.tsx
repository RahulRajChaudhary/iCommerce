import Link from "next/link";
import React, { useEffect, useState } from "react";
import Ratings from "../ratings";
import { Eye, Heart, ShoppingBag, Clock, Zap, Tag } from "lucide-react";
import ProductDetailsCard from "./product-details";
import { useStore } from "@/store/index";
import useUser from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === product.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === product.id);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
      }, 60000);
      return () => clearInterval(interval);
    }
    return;
  }, [isEvent, product?.ending_date]);

  // Calculate discount percentage
  const discount = Math.round(
    ((product?.regular_price - product?.sale_price) / product?.regular_price) *
      100
  );

  return (
    <>
      <div className="w-full min-h-[400px] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col">
        {/* Image Container */}
        <div className="relative overflow-hidden flex-grow">
          {isEvent && (
            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
              <Tag size={12} className="mr-1" />
              OFFER
            </div>
          )}

          {product?.stock <= 5 && (
            <div className="absolute top-3 right-3 z-10 bg-amber-400 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center">
              <Zap size={12} className="mr-1" />
              Low Stock
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}

          <Link href={`/product/${product?.slug}`} className="block h-full">
            <img
              src={
                product?.images[0]?.url ||
                "https://images.unsplash.com/photo-1635405074683-96d6921a2a68?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGVjb21tZXJjZXxlbnwwfHwwfHx8MA%3D%3D"
              }
              alt={product?.title}
              className="w-full h-[220px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Action Buttons - Always visible but subtle */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className="bg-white rounded-full p-2 shadow-lg hover:bg-blue-50 transition-all"
              onClick={() => setOpen(true)}
              aria-label="Quick view"
            >
              <Eye size={16} className="text-gray-600" />
            </button>
            <button
              className="bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-all"
              onClick={() =>
                isWishlisted
                  ? removeFromWishlist(product.id, user, location, deviceInfo)
                  : addToWishlist(
                      { ...product, quantity: 1 },
                      user,
                      location,
                      deviceInfo
                    )
              }
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={16}
                fill={isWishlisted ? "red" : "white"}
                className={isWishlisted ? "text-red-500" : "text-gray-600"}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <Link
            href={`/shop/${product?.Shop?.id}`}
            className="text-blue-500 text-xs font-semibold mb-1 hover:underline line-clamp-1"
          >
            {product?.Shop?.name}
          </Link>
          
          <Link href={`/product/${product?.slug}`} className="flex-grow">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2">
              {product?.title}
            </h3>
          </Link>

          <div className="mb-3">
            <Ratings rating={product?.ratings} />
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  ${product?.sale_price}
                </span>
                {product?.regular_price > product?.sale_price && (
                  <span className="text-sm line-through text-gray-400">
                    ${product?.regular_price}
                  </span>
                )}
              </div>
              <span className="text-green-600 text-sm font-medium">
                {product.totalSales} sold
              </span>
            </div>

            {isEvent && timeLeft && (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-medium px-3 py-2 rounded-lg mb-3">
                <Clock size={14} />
                <span>{timeLeft}</span>
              </div>
            )}

            <button
              className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                isInCart
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={() =>
                !isInCart &&
                addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)
              }
              disabled={isInCart}
            >
              <ShoppingBag size={16} />
              {isInCart ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 animate-fadeIn">
          <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <button
              className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <ProductDetailsCard data={product} setOpen={setOpen} />
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ProductCard;