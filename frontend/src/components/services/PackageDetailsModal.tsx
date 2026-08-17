import React, { useEffect } from 'react';
import { ServicePackage } from '../../types';
import { X, Star, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface PackageDetailsModalProps {
  pkg: ServicePackage;
  onClose: () => void;
  onAdd: (e: React.MouseEvent) => void;
  isAdded: boolean;
  isActionLoading: boolean;
}

export const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({
  pkg,
  onClose,
  onAdd,
  isAdded,
  isActionLoading,
}) => {
  // Close on Escape key & prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const basePrice = Number(pkg.base_price || 0);
  const discountPrice = Number(pkg.discount_price || 0);
  const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
  const displayPrice = hasDiscount ? discountPrice : basePrice;

  const imageUrl = pkg.package_image || '/service-collage.jpg';

  const inclusions = [
    'Complete pre-service inspection and assessment',
    'Deep cleaning / treatment using commercial-grade tools',
    'Application of eco-friendly and pet-safe products',
    'Final sanitization and quality check with customer walkthrough',
  ];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-48 bg-[#F5F5F5] overflow-hidden shrink-0">
          <img
            src={imageUrl}
            alt={pkg.pack_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/service-collage.jpg';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#737373] mb-1">
              <span>{pkg.service_name}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#5B21B6] font-bold">
                <Star className="w-3 h-3 fill-[#7C3AED] text-[#7C3AED]" /> 4.82 (240+ reviews)
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-[#1C1C1C] leading-snug">
              {pkg.pack_name}
            </h2>
          </div>

          {/* Description */}
          {pkg.description && (
            <p className="text-[13px] text-[#525252] leading-relaxed">
              {pkg.description}
            </p>
          )}

          {/* Inclusions checklist */}
          <div className="border-t border-[#F0F0F0] pt-4 space-y-3">
            <h4 className="text-[13px] font-bold text-[#1C1C1C] uppercase tracking-wide">
              What's Included
            </h4>
            <div className="space-y-2">
              {inclusions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[13px] text-[#404040]">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl p-4 grid grid-cols-2 gap-3 text-[12px] text-[#525252]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
              <span>30-day warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7C3AED]" />
              <span>On-time arrival</span>
            </div>
          </div>
        </div>

        {/* Sticky Modal Footer */}
        <div className="p-4 border-t border-[#E8E8E8] bg-white flex items-center justify-between gap-4 sticky bottom-0">
          <div>
            <div className="text-[11px] text-[#737373]">Total price</div>
            <div className="text-[18px] font-bold text-[#1C1C1C]">
              ₹{displayPrice.toLocaleString('en-IN')}
              {hasDiscount && (
                <span className="text-[12px] text-[#A0A0A0] line-through ml-2 font-normal">
                  ₹{basePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              onAdd(e);
              onClose();
            }}
            disabled={isActionLoading || isAdded}
            className="px-6 py-2.5 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isAdded ? 'Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
