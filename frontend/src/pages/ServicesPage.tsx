import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useServices } from '../hooks/useServices';
import { useServicePackages } from '../hooks/useServicePackages';
import { SidebarServiceSelector } from '../components/services/SidebarServiceSelector';
import { ServicePackageRow } from '../components/services/ServicePackageRow';
import { ServoraPromiseCard } from '../components/services/ServoraPromiseCard';
import { MiniCartWidget } from '../components/services/MiniCartWidget';
import { EmptyState } from '../components/common/EmptyState';
import { SlidersHorizontal, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

/*
 * Category Route Normalization:
 * URL param -> Frappe Doc name
 */
const ROUTE_TO_CATEGORY: Record<string, string> = {
  'Home Cleaning': 'Cleaning',
  'Cleaning': 'Cleaning',
  'Painting': 'Painting and Water Proofing',
  'Painting and Water Proofing': 'Painting and Water Proofing',
  'Pest Control': 'Pest Control',
};

const CATEGORY_BANNERS: Record<string, { title: string; subtitle: string; discountText: string; image: string }> = {
  'Cleaning': {
    title: 'Deep Home & Kitchen Cleaning',
    subtitle: 'Professional deep sanitization with industrial equipment & eco-friendly chemicals.',
    discountText: 'UPTO 25% OFF',
    image: '/files/svc_kitchen.jpg',
  },
  'Painting and Water Proofing': {
    title: 'Express Interior & Wall Painting',
    subtitle: 'Premium dust-free painting with laser precision, masking tape & 1-year warranty.',
    discountText: 'UPTO 20% OFF',
    image: '/files/svc_walls_paint.jpg',
  },
  'Pest Control': {
    title: 'Advanced Pest & Termite Control',
    subtitle: 'Odorless government-approved chemicals with drill-fill-seal barrier warranty.',
    discountText: 'UPTO 30% OFF',
    image: '/files/svc_termite.jpg',
  },
};

export const ServicesPage: React.FC = () => {
  const { service: routeParam } = useParams<{ service?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const decodedRouteParam = routeParam ? decodeURIComponent(routeParam) : '';
  const serviceFromQuery = searchParams.get('service') || '';

  const resolvedCategory = ROUTE_TO_CATEGORY[decodedRouteParam] || decodedRouteParam || 'Cleaning';

  const [selectedCategory, setSelectedCategory] = useState<string>(resolvedCategory);
  const [selectedService, setSelectedService] = useState<string>(serviceFromQuery);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { itemsCount, cart } = useCart();

  // Sync category & subservice from route changes
  useEffect(() => {
    const resolved = ROUTE_TO_CATEGORY[decodedRouteParam] || decodedRouteParam || 'Cleaning';
    setSelectedCategory(resolved);
    setSelectedService(serviceFromQuery);
    setSearchQuery('');
  }, [decodedRouteParam, serviceFromQuery]);

  // ── Fetch real data using hooks ──
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { services, isLoading: isServicesLoading } = useServices(selectedCategory || undefined);
  const { packages, isLoading: isPackagesLoading } = useServicePackages();

  // ── Client-side filtering ──
  const filteredPackages = useMemo(() => {
    let result = packages;

    // Filter by category
    if (selectedCategory) {
      const categoryServices = services.map((s) => s.service_name);
      if (categoryServices.length > 0) {
        result = result.filter((pkg) => categoryServices.includes(pkg.service_name));
      }
    }

    // Filter by specific sub-service
    if (selectedService) {
      result = result.filter((pkg) => pkg.service_name === selectedService);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (pkg) =>
          pkg.pack_name.toLowerCase().includes(q) ||
          pkg.service_name.toLowerCase().includes(q) ||
          (pkg.description || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [packages, selectedCategory, selectedService, services, searchQuery]);

  const isLoading = isCategoriesLoading || isServicesLoading || isPackagesLoading;

  const currentBanner =
    CATEGORY_BANNERS[selectedCategory] || {
      title: `${selectedCategory || 'Home'} Services`,
      subtitle: 'Verified professionals · Quality assured · Fixed prices',
      discountText: 'SPECIAL OFFERS',
      image: '/service-collage.jpg',
    };

  const handleSelectSubService = (serviceName: string) => {
    setSelectedService(serviceName);
    if (serviceName) {
      setSearchParams({ service: serviceName });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-16">
      {/* ── Main 3-Column Container (Urban Company Architecture) ── */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Clean Single Breadcrumb */}
        <div className="flex items-center justify-between text-[13px] text-[#737373]">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-[#1C1C1C] transition-colors">Home</Link>
            <span className="text-[#D1D1D1]">/</span>
            <Link
              to={`/services/${encodeURIComponent(selectedCategory)}`}
              onClick={() => setSelectedService('')}
              className={`hover:text-[#1C1C1C] transition-colors ${!selectedService ? 'font-bold text-[#1C1C1C]' : ''}`}
            >
              {selectedCategory}
            </Link>
            {selectedService && (
              <>
                <span className="text-[#D1D1D1]">/</span>
                <span className="font-bold text-[#1C1C1C]">{selectedService}</span>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-6 items-start">
          {/* ═════════════════════════════════════════════
              COLUMN 1: Left Sticky Sidebar (Service Selector)
             ═════════════════════════════════════════════ */}
          <div className="hidden lg:block sticky top-[134px]">
            <SidebarServiceSelector
              services={services}
              selectedService={selectedService}
              onSelectService={handleSelectSubService}
            />

            {/* Category Switcher Pill List */}
            <div className="mt-4 bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                Other Categories
              </span>
              <div className="space-y-1 pt-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/services/${encodeURIComponent(cat.category_name)}`}
                    className={`block px-3 py-2 rounded-xl text-[12px] font-medium transition-colors ${
                      selectedCategory === cat.category_name
                        ? 'bg-[#1C1C1C] text-white font-bold'
                        : 'text-[#525252] hover:bg-[#F5F5F5] hover:text-[#1C1C1C]'
                    }`}
                  >
                    {cat.category_name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Service Selector (Horizontal scrolling bar) */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-2 scrollbar-none flex gap-2">
            <button
              onClick={() => handleSelectSubService('')}
              className={`shrink-0 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all ${
                !selectedService
                  ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                  : 'bg-white text-[#525252] border-[#E8E8E8]'
              }`}
            >
              All
            </button>
            {services.map((svc) => (
              <button
                key={svc.name}
                onClick={() => handleSelectSubService(svc.service_name)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[12px] font-bold transition-all ${
                  selectedService === svc.service_name
                    ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                    : 'bg-white text-[#525252] border-[#E8E8E8]'
                }`}
              >
                {svc.service_image && (
                  <img
                    src={svc.service_image}
                    alt={svc.service_name}
                    className="w-5 h-5 rounded object-cover"
                  />
                )}
                <span>{svc.service_name}</span>
              </button>
            ))}
          </div>

          {/* ═════════════════════════════════════════════
              COLUMN 2: Center Content (Banner + Packages Feed)
             ═════════════════════════════════════════════ */}
          <div className="space-y-6 min-w-0">
            {/* Feature Promotional Deal Banner (Urban Company style) */}
            <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row items-stretch">
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-center">
                <div className="inline-flex items-center gap-1.5 bg-[#059669] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md mb-3 w-fit tracking-wide">
                  <Tag className="w-3 h-3" />
                  {currentBanner.discountText}
                </div>
                <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#1C1C1C] leading-tight mb-2">
                  {currentBanner.title}
                </h2>
                <p className="text-[13px] text-[#737373] leading-relaxed mb-4">
                  {currentBanner.subtitle}
                </p>
                <div className="flex items-center gap-2 text-[12px] text-[#525252] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                  <span>30-Day Happiness Guarantee Included</span>
                </div>
              </div>

              <div className="w-full sm:w-48 h-40 sm:h-auto bg-[#F5F5F5] overflow-hidden shrink-0">
                <img
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/service-collage.jpg';
                  }}
                />
              </div>
            </div>

            {/* Filter Summary & Count */}
            <div className="flex items-center justify-between px-1">
              <div className="text-[13px] text-[#737373]">
                Showing <strong className="text-[#1C1C1C] font-bold">{filteredPackages.length}</strong> packages in{' '}
                <strong className="text-[#1C1C1C] font-bold">{selectedService || selectedCategory}</strong>
              </div>
              {(selectedService || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedService('');
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="text-[12px] font-bold text-[#5B21B6] hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Packages Feed */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-44 bg-white border border-[#E8E8E8] rounded-2xl animate-pulse p-6"
                  />
                ))}
              </div>
            ) : filteredPackages.length > 0 ? (
              <div className="space-y-4">
                {filteredPackages.map((pkg) => (
                  <ServicePackageRow key={pkg.name} pkg={pkg} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<SlidersHorizontal className="w-8 h-8" />}
                title="No packages found"
                description={
                  selectedService
                    ? `We currently don't have packages listed under "${selectedService}".`
                    : 'No service packages match your selected filters.'
                }
                actionText="View all services"
                onAction={() => {
                  setSelectedService('');
                  setSearchQuery('');
                  setSearchParams({});
                }}
              />
            )}
          </div>

          {/* ═════════════════════════════════════════════
              COLUMN 3: Right Sticky Sidebar (Promise + Cart)
             ═════════════════════════════════════════════ */}
          <div className="hidden lg:block sticky top-[134px] space-y-4">
            <ServoraPromiseCard />
            <MiniCartWidget />
          </div>
        </div>
      </div>

      {/* Mobile Floating Cart Button */}
      {itemsCount > 0 && (
        <div className="lg:hidden fixed bottom-16 left-4 right-4 z-40 animate-fade-in">
          <Link
            to="/cart"
            className="w-full bg-[#1C1C1C] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-white text-[#1C1C1C] text-xs font-black flex items-center justify-center shrink-0">
                {itemsCount}
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[11px] text-[#A0A0A0] font-medium leading-none mb-1">
                  {itemsCount === 1 ? '1 service added' : `${itemsCount} services added`}
                </span>
                <span className="text-[14px] font-bold leading-none">
                  ₹{Number(cart?.grand_total || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">
              View Cart →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};
