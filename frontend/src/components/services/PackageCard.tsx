import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServicePackage } from '../../types';
import { useCart } from '../../context/CartContext';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Star, Check, Plus } from 'lucide-react';

interface PackageCardProps {
  pkg: ServicePackage;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg }) => {
  const { hasItem, addToCart, isActionLoading } = useCart();
  const { currentUser } = useFrappeAuth();
  const navigate = useNavigate();

  const isAdded = hasItem(pkg.pack_name);
  const isLoggedIn = currentUser && currentUser !== 'Guest';

  const basePrice = Number(pkg.base_price || 0);
  const discountPrice = Number(pkg.discount_price || 0);
  const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
  const displayPrice = hasDiscount ? discountPrice : basePrice;
  const discountPct = hasDiscount ? Math.round(((basePrice - discountPrice) / basePrice) * 100) : 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    await addToCart(pkg.pack_name);
  };

  const imageUrl = pkg.package_image || '/service-collage.jpg';

  return (
    <div className="group bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:border-[#D1D1D1] hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between">
      {/* Top Image & Badge */}
      <div className="relative h-44 bg-[#F5F5F5] overflow-hidden">
        <img
          src={imageUrl}
          alt={pkg.pack_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/service-collage.jpg';
          }}
        />
        {/* Category Tag overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-[#1C1C1C] shadow-sm">
          {pkg.service_name}
        </div>

        {discountPct > 0 && (
          <div className="absolute top-3 right-3 bg-[#059669] text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide shadow-sm">
            {discountPct}% OFF
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B21B6] bg-[#F5F3FF] px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 fill-[#7C3AED] text-[#7C3AED]" />
              4.8
            </span>
            <span className="text-[11px] text-[#737373]">(250+ bookings)</span>
          </div>

          {/* Title */}
          <Link to={`/service-package/${encodeURIComponent(pkg.pack_name)}`}>
            <h3 className="text-[15px] font-bold text-[#1C1C1C] leading-snug line-clamp-2 mb-2 group-hover:text-[#5B21B6] transition-colors">
              {pkg.pack_name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-[12px] text-[#737373] leading-relaxed line-clamp-2 mb-4">
            {pkg.description || `Professional ${pkg.service_name.toLowerCase()} service by verified experts.`}
          </p>
        </div>

        {/* Footer: Price + Add Button */}
        <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-between gap-2">
          <div>
            <div className="text-[16px] font-extrabold text-[#1C1C1C]">
              ₹{displayPrice.toLocaleString('en-IN')}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-[#A0A0A0] line-through -mt-0.5">
                ₹{basePrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {isAdded ? (
            <Link to="/cart">
              <button className="flex items-center gap-1 text-[12px] font-bold text-[#1C1C1C] border border-[#1C1C1C] rounded-lg px-3 py-1.5 hover:bg-[#F5F5F5] transition-colors">
                <Check className="w-3 h-3 text-[#059669]" />
                Added
              </button>
            </Link>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isActionLoading}
              className="flex items-center gap-1 text-[12px] font-bold text-[#5B21B6] bg-white border border-[#7C3AED] hover:bg-[#F5F3FF] rounded-lg px-4 py-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isActionLoading ? (
                <div className="w-3 h-3 border-2 border-[#7C3AED]/40 border-t-[#7C3AED] rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
