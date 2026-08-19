import React, { useState } from 'react';
import { ServicePackage } from '../../types';
import { useCart } from '../../context/CartContext';
import { useFrappeAuth } from 'frappe-react-sdk';
import { useNavigate } from 'react-router-dom';
import { Star, Check, Plus, Minus, Info } from 'lucide-react';
import { PackageDetailsModal } from './PackageDetailsModal';

interface ServicePackageRowProps {
  pkg: ServicePackage;
}

export const ServicePackageRow: React.FC<ServicePackageRowProps> = ({ pkg }) => {
  const { hasItem, addToCart, removeFromCart, isActionLoading } = useCart();
  const { currentUser } = useFrappeAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const isAdded = hasItem(pkg.name);
  const isLoggedIn = currentUser && currentUser !== 'Guest';

  const basePrice = Number(pkg.base_price || 0);
  const discountPrice = Number(pkg.discount_price || 0);
  const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
  const displayPrice = hasDiscount ? discountPrice : basePrice;
  const discountPct = hasDiscount ? Math.round(((basePrice - discountPrice) / basePrice) * 100) : 0;

  // Split description into bullet points
  const bulletPoints = pkg.description
    ? pkg.description
        .split(/(?:\. |\n|; )/)
        .map((s) => s.trim().replace(/^\W+/, ''))
        .filter((s) => s.length > 3)
        .slice(0, 3)
    : [
        `Professional ${pkg.service_name.toLowerCase()} by background-verified experts`,
        'Includes high-grade equipment and specialized chemicals',
        'Transparent pricing with 30-day service warranty',
      ];

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    await addToCart(pkg.name);
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromCart(pkg.name);
  };

  const imageUrl = pkg.package_image || '/service-collage.jpg';

  return (
    <>
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 sm:p-6 transition-all hover:border-[#D1D1D1] hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.06)]">
        <div className="flex flex-col-reverse sm:flex-row sm:items-start justify-between gap-5">
          {/* Left Column: Details */}
          <div className="flex-1 min-w-0 pr-0 sm:pr-4">
            {/* Title */}
            <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1C1C1C] leading-snug tracking-tight mb-1.5">
              {pkg.pack_name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#5B21B6] bg-[#F5F3FF] px-2 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-[#7C3AED] text-[#7C3AED]" />
                4.82
              </span>
              <span className="text-[12px] text-[#737373] font-medium">(240+ reviews)</span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-2 mb-3 flex-wrap">
              <span className="text-[18px] sm:text-[20px] font-extrabold text-[#1C1C1C]">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-[13px] text-[#A0A0A0] line-through">
                  ₹{basePrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPct > 0 && (
                <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#F0F0F0] my-3" />

            {/* Bullet points description */}
            <ul className="space-y-1.5 mb-3 text-[13px] text-[#525252]">
              {bulletPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#1C1C1C] text-[15px] leading-none mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {/* View Details Link */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-[13px] font-semibold text-[#5B21B6] hover:text-[#4C1D95] underline underline-offset-4 flex items-center gap-1 transition-colors"
            >
              <Info className="w-3.5 h-3.5 inline" />
              View details
            </button>
          </div>

          {/* Right Column: Image + Add Button (UC Style) */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
            {/* Image Thumbnail */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E8E8E8] shrink-0">
              <img
                src={imageUrl}
                alt={pkg.pack_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/service-collage.jpg';
                }}
              />
            </div>

            {/* Add Button */}
            <div className="w-28">
              {isAdded ? (
                <div className="flex items-center justify-between w-full h-9 bg-white border-2 border-[#1C1C1C] rounded-lg px-2 shadow-sm">
                  <button
                    onClick={handleRemove}
                    disabled={isActionLoading}
                    className="p-1 text-[#1C1C1C] hover:bg-[#F5F5F5] rounded transition-colors disabled:opacity-50"
                    title="Remove from cart"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[13px] font-bold text-[#1C1C1C]">1</span>
                  <button
                    onClick={handleAdd}
                    disabled={true}
                    className="p-1 text-[#A0A0A0] cursor-not-allowed"
                    title="Already added"
                  >
                    <Check className="w-3.5 h-3.5 text-[#059669]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isActionLoading}
                  className="w-full h-9 bg-white hover:bg-[#F5F3FF] text-[#5B21B6] border border-[#7C3AED] hover:border-[#6D28D9] text-[13px] font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#7C3AED]/40 border-t-[#7C3AED] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Add
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Package Details Modal */}
      {showModal && (
        <PackageDetailsModal
          pkg={pkg}
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          isAdded={isAdded}
          isActionLoading={isActionLoading}
        />
      )}
    </>
  );
};
