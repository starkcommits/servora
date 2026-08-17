import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useServicePackage } from '../hooks/useServicePackages';
import { useCart } from '../context/CartContext';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Skeleton } from '../components/common/Skeleton';
import {
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Plus,
  Check,
  HelpCircle,
} from 'lucide-react';

export const PackageDetailPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const decodedPackageId = packageId ? decodeURIComponent(packageId) : '';
  const { packageDoc, isLoading, error } = useServicePackage(decodedPackageId);
  const { hasItem, addToCart, isActionLoading } = useCart();
  const { currentUser } = useFrappeAuth();
  const navigate = useNavigate();

  const isAdded = hasItem(decodedPackageId);
  const isLoggedIn = currentUser && currentUser !== 'Guest';

  const handleAdd = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    await addToCart(decodedPackageId);
  };

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !packageDoc) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1C1C1C]">Service Package Not Found</h2>
        <p className="text-sm text-[#737373]">The requested package does not exist or is inactive.</p>
        <Link to="/services">
          <button className="px-5 py-2.5 bg-[#1C1C1C] text-white rounded-xl text-sm font-bold hover:bg-[#404040]">
            Browse Services
          </button>
        </Link>
      </div>
    );
  }

  const basePrice = Number(packageDoc.base_price || 0);
  const discountPrice = Number(packageDoc.discount_price || 0);
  const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
  const displayPrice = hasDiscount ? discountPrice : basePrice;
  const discountPct = hasDiscount ? Math.round(((basePrice - discountPrice) / basePrice) * 100) : 0;

  const imageUrl = packageDoc.package_image || '/service-collage.jpg';

  const inclusions = [
    'Deep cleaning and chemical sanitization with government-approved agents',
    'Specialized machine buffing and high-pressure steam treatment',
    'Removal of tough stains, grease, grime, and hard water deposits',
    'Post-service cleanup and hygiene verification by lead expert',
    '30-day service satisfaction warranty with free rework support',
  ];

  const exclusions = [
    'Repairs of electrical appliances or plumbing pipe lines',
    'Moving heavy fixed masonry furniture beyond 15kg',
  ];

  const faqs = [
    {
      q: 'Do I need to provide cleaning liquids or machines?',
      a: 'No, our service professionals bring all industrial-grade chemicals, safety tools, vacuum cleaners, and scrubbers.',
    },
    {
      q: 'Can I reschedule my service slot later?',
      a: 'Yes, you can easily reschedule your booking free of charge up to 2 hours before the scheduled time slot.',
    },
    {
      q: 'Is Cash on Delivery available for this package?',
      a: 'Yes! You can choose Cash On Delivery during checkout and pay after our professional finishes the job.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-16 pt-6">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Single Clean Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-[#737373]">
          <Link to="/" className="hover:text-[#1C1C1C]">Home</Link>
          <span className="text-[#D1D1D1]">/</span>
          <Link to="/services" className="hover:text-[#1C1C1C]">Services</Link>
          <span className="text-[#D1D1D1]">/</span>
          <span className="text-[#525252]">{packageDoc.service_name}</span>
          <span className="text-[#D1D1D1]">/</span>
          <span className="font-bold text-[#1C1C1C] line-clamp-1">{packageDoc.pack_name}</span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E8E8] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#5B21B6] bg-[#F5F3FF] px-2.5 py-0.5 rounded-md">
                  {packageDoc.service_name}
                </span>
                <div className="flex items-center gap-1 bg-[#FFFBEB] px-2 py-0.5 rounded-md text-[#D97706] text-[11px] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>4.85 (1.2k+ reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1C] tracking-tight leading-tight">
                {packageDoc.pack_name}
              </h1>

              <p className="text-[14px] text-[#525252] leading-relaxed">
                {packageDoc.description || `Professional ${packageDoc.service_name.toLowerCase()} package delivered by verified experts with complete hygiene standards.`}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#F0F0F0] text-[12px] text-[#525252] font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#7C3AED]" />
                  <span>Duration: ~90 mins</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                  <span>Warranty: 30 Days</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>Verified Experts</span>
                </span>
              </div>
            </div>

            {/* Inclusions / Exclusions */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E8E8] shadow-sm space-y-6">
              <div>
                <h3 className="text-[16px] font-bold text-[#1C1C1C] mb-4">
                  What is included in this service
                </h3>
                <div className="space-y-3">
                  {inclusions.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-[13px] text-[#404040]">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#F0F0F0] pt-6">
                <h3 className="text-[16px] font-bold text-[#1C1C1C] mb-4">
                  What is not included
                </h3>
                <div className="space-y-3">
                  {exclusions.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-[13px] text-[#737373]">
                      <XCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E8E8] shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-[16px] font-bold text-[#1C1C1C]">
                  Frequently Asked Questions
                </h3>
              </div>
              <div className="divide-y divide-[#F0F0F0]">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="py-4 space-y-1.5">
                    <h4 className="text-[14px] font-bold text-[#1C1C1C]">{faq.q}</h4>
                    <p className="text-[13px] text-[#525252] leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sticky Checkout Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E8E8E8] shadow-sm">
              <div className="h-44 bg-[#F5F5F5] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={packageDoc.pack_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/service-collage.jpg';
                  }}
                />
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#737373] mb-1">
                    Transparent Pricing
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-black text-[#1C1C1C]">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    {hasDiscount && (
                      <span className="text-[14px] text-[#A0A0A0] line-through">
                        ₹{basePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-[12px] text-[#525252]">
                  <div className="flex items-center justify-between">
                    <span>Base package rate</span>
                    <span>₹{displayPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Standard platform fee</span>
                    <span>₹49</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-[#1C1C1C] pt-2 border-t border-[#F0F0F0]">
                    <span>Estimated total</span>
                    <span>₹{(displayPrice + 49).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {isAdded ? (
                  <Link
                    to="/cart"
                    className="w-full h-11 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4 text-[#059669]" />
                    <span>Added · View in Cart</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleAdd}
                    disabled={isActionLoading}
                    className="w-full h-11 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isActionLoading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
