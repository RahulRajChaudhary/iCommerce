import { ArrowUpRight, MapPin, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar: string;
    coverBanner?: string;
    address?: string;
    followers?: [];
    rating?: number;
    category?: string;
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="w-full rounded-2xl cursor-pointer bg-white border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      {/* Enhanced Cover Banner with gradient overlay */}
      <div className="h-[180px] w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
        <Image
          src={
            shop?.coverBanner ||
            "https://ik.imagekit.io/mu0woh4fs/iCommerce%20Minimalist%20Banner_imagen.png?updatedAt=1757916997591"
          }
          alt="Cover"
          fill
          className={`object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          priority
        />
        
        {/* Category Badge */}
        {shop?.category && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full capitalize shadow-sm">
              {shop.category}
            </span>
          </div>
        )}
      </div>

      {/* Avatar with improved positioning */}
      <div className="relative flex justify-center -mt-12">
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl bg-white z-20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
          <Image
            src={
              shop.avatar ||
              "https://ik.imagekit.io/mu0woh4fs/iCommerce%20Cartoon%20Profile.jpg?updatedAt=1757917555256"
            }
            alt={shop.name}
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="px-5 pb-5 pt-4">
        <h3 className="text-xl font-bold text-gray-900 text-center line-clamp-1 group-hover:text-blue-600 transition-colors">
          {shop?.name}
        </h3>
        
        {/* Rating and Followers */}
        <div className="flex items-center justify-center mt-3 gap-5">
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-gray-800">{shop.rating ?? "N/A"}</span>
          </div>
          
          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-800">{shop?.followers?.length ?? 0}</span>
          </div>
        </div>
        
        {/* Address */}
        {shop.address && (
          <div className="flex items-center justify-center text-sm text-gray-600 mt-4 bg-gray-50 py-2 px-3 rounded-lg">
            <MapPin className="w-4 h-4 mr-1.5 text-blue-500" />
            <span className="truncate text-center">{shop.address}</span>
          </div>
        )}

        {/* Visit Button */}
        <div className="mt-5 flex justify-center">
          <Link
            href={`/shop/${shop.id}`}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg shadow-blue-200 hover:shadow-blue-300 w-full max-w-[160px]"
          >
            Visit Shop
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;