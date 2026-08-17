import React, { useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useServicePackages } from '../../hooks/useServicePackages';
import { Star, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';
import { ServicePackage } from '../../types';

export const PopularPackages: React.FC = () => {
  const { packages, isLoading } = useServicePackages();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Pick exactly ONE top package per unique service category / sub-service
  const distinctPackages = useMemo(() => {
    const seenServices = new Set<string>();
    const result: ServicePackage[] = [];
    for (const pkg of packages) {
      if (!seenServices.has(pkg.service_name)) {
        seenServices.add(pkg.service_name);
        result.push(pkg);
      }
    }
    return result;
  }, [packages]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white border-b border-[#E8E8E8]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1C1C1C] tracking-tight">
            Most booked services
          </h2>
          <Link
            to="/services"
            className="text-[13px] font-semibold text-[#1C1C1C] hover:text-[#5B21B6] transition-colors flex items-center gap-1"
          >
            <span>See all</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal Carousel */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="w-[200px] shrink-0 space-y-2.5">
                <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative group">
            {/* Scroll Container */}
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {distinctPackages.map((pkg) => {
                const basePrice = Number(pkg.base_price || 0);
                const discountPrice = Number(pkg.discount_price || 0);
                const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
                const displayPrice = hasDiscount ? discountPrice : basePrice;
                const imageUrl = pkg.package_image || '/service-collage.jpg';

                return (
                  <div
                    key={pkg.name}
                    onClick={() => navigate(`/service-package/${encodeURIComponent(pkg.pack_name)}`)}
                    className="w-[190px] sm:w-[220px] shrink-0 cursor-pointer group/item flex flex-col"
                  >
                    {/* Image Container — UC style: rounded-2xl aspect-[4/3] */}
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F5F5F5] border border-[#F0F0F0] mb-2.5 relative">
                      <img
                        src={imageUrl}
                        alt={pkg.pack_name}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/service-collage.jpg';
                        }}
                      />
                    </div>

                    {/* Service / Package Title */}
                    <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#1C1C1C] leading-snug line-clamp-1 group-hover/item:text-[#5B21B6] transition-colors">
                      {pkg.pack_name}
                    </h3>

                    {/* Rating & Tag */}
                    <div className="flex items-center gap-1.5 text-[12px] text-[#525252] mt-1">
                      <div className="flex items-center gap-0.5 font-bold text-[#1C1C1C]">
                        <Star className="w-3 h-3 fill-[#1C1C1C] text-[#1C1C1C]" />
                        <span>4.82</span>
                      </div>
                      <span>•</span>
                      <span className="text-[#059669] font-medium flex items-center gap-0.5 text-[11px]">
                        <Zap className="w-3 h-3 fill-[#059669]" />
                        Instant
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-[14px] font-bold text-[#1C1C1C]">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="text-[12px] text-[#A0A0A0] line-through">
                          ₹{basePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Navigation Arrows (Desktop) */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute -left-4 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.12)] border border-[#E8E8E8] items-center justify-center text-[#1C1C1C] hover:bg-[#F5F5F5] transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-4 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.12)] border border-[#E8E8E8] items-center justify-center text-[#1C1C1C] hover:bg-[#F5F5F5] transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
