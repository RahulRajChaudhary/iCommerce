"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoveRight, Sparkles, Zap, Clock, Shield } from "lucide-react";

const Hero = () => {
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const features = [
    { icon: <Sparkles size={24} />, text: "Premium Quality" },
    { icon: <Zap size={24} />, text: "Fast Shipping" },
    { icon: <Clock size={24} />, text: "Lifetime Warranty" },
    { icon: <Shield size={24} />, text: "Secure Payment" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setIsTransitioning(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div 
      className="relative min-h-[85vh] flex flex-col justify-center w-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(0, 102, 204, 0.85), rgba(0, 71, 171, 0.9)), url('https://ik.imagekit.io/mu0woh4fs/hero-section.png?updatedAt=1757339713543') center/cover no-repeat"
      }}
    >
    

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-float"
            style={{
              top: `${10 + (i * 6) % 80}%`,
              left: `${5 + (i * 7) % 90}%`,
              width: `${30 + (i * 10) % 70}px`,
              height: `${30 + (i * 10) % 70}px`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${15 + (i * 2) % 10}s`,
            }}
          />
        ))}
      </div>

      {/* Animated circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-white/10 animate-ping-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/5 animate-pulse-slow" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
       
        <h1 className="text-white text-5xl md:text-7xl font-extrabold font-Roboto mb-6 animate-slide-up">
          Discover Our
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 animate-gradient-x">
            Premium Collection
          </span>
          2025
        </h1>
        
        <div className="h-10 flex items-center justify-center">
          <div className={`flex items-center space-x-2 text-white/90 transition-all duration-500 ${isTransitioning ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
            {features[currentFeature].icon}
            <span className="font-Roboto text-lg">{features[currentFeature].text}</span>
          </div>
        </div>
        
        <p className="font-Oregano text-2xl md:text-3xl pt-4 text-white/90 mb-8 animate-fade-in">
          Exclusive offer <span className="text-yellow-400 animate-pulse">10%</span> off this week
        </p>
        
        <button
          onClick={() => router.push("/products")}
          className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-semibold text-[#0066CC] transition-all duration-300 bg-white rounded-lg hover:bg-gray-100 hover:scale-105"
        >
          <span className="relative">Shop Now</span>
          <MoveRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          <div className="absolute inset-0 transition-all duration-300 group-hover:bg-white/30 rounded-lg"></div>
        </button>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0% { 
            transform: translateY(0) rotate(0deg) scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-30px) rotate(5deg) scale(1.05); 
            opacity: 0.5; 
          }
          100% { 
            transform: translateY(0) rotate(0deg) scale(1); 
            opacity: 0.3; 
          }
        }
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.5; }
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.05); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-float { 
          animation: float 15s infinite ease-in-out; 
          will-change: transform, opacity;
        }
        .animate-ping-slow { 
          animation: ping-slow 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, opacity;
        }
        .animate-pulse-slow { 
          animation: pulse-slow 6s infinite ease-in-out;
          will-change: opacity, transform;
        }
        .animate-gradient-x { 
          background-size: 200% auto;
          animation: gradient-x 3s infinite linear; 
        }
        .animate-slide-up { 
          animation: slide-up 1s ease-out forwards;
          will-change: transform, opacity;
        }
        .animate-fade-in { 
          animation: fade-in 1.5s ease-out forwards;
          will-change: opacity;
        }
      `}</style>
    </div>
  );
};

export default Hero;