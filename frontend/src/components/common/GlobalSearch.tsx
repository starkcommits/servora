import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../../hooks/useServices';
import { useServicePackages } from '../../hooks/useServicePackages';
import { Search, X, Sparkles, ArrowRight, Tag } from 'lucide-react';

interface GlobalSearchProps {
  onSelect?: () => void;
  className?: string;
  autoFocus?: boolean;
}

const TRENDING_SEARCHES = [
  'Bathroom Cleaning',
  'Kitchen Deep Clean',
  'Full Home Painting',
  'Termite Control',
  'Sofa Cleaning',
  '1 BHK Deep Cleaning',
];

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onSelect,
  className = '',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { services } = useServices();
  const { packages } = useServicePackages();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching services & packages
  const trimmed = query.trim().toLowerCase();

  const matchedServices = trimmed
    ? services.filter(
        (s) =>
          s.service_name.toLowerCase().includes(trimmed) ||
          s.service_category.toLowerCase().includes(trimmed)
      )
    : [];

  const matchedPackages = trimmed
    ? packages.filter(
        (p) =>
          p.pack_name.toLowerCase().includes(trimmed) ||
          p.service_name.toLowerCase().includes(trimmed)
      )
    : [];

  const handleSelectService = (category: string, serviceName: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/services/${encodeURIComponent(category)}?service=${encodeURIComponent(serviceName)}`);
    onSelect?.();
  };

  const handleSelectPackage = (packName: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/service-package/${encodeURIComponent(packName)}`);
    onSelect?.();
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      navigate(`/services?search=${encodeURIComponent(query.trim())}`);
      onSelect?.();
    }
  };

  const hasResults = matchedServices.length > 0 || matchedPackages.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-[#F5F5F5] hover:bg-[#EFEFEF] focus-within:bg-white border border-[#E8E8E8] focus-within:border-[#1C1C1C] focus-within:ring-2 focus-within:ring-[#1C1C1C]/10 rounded-xl px-3 py-2 transition-all">
        <Search className="w-3.5 h-3.5 text-[#A0A0A0] shrink-0 mr-2" />
        <input
          ref={inputRef}
          type="text"
          autoFocus={autoFocus}
          placeholder="Search for services, packages..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-[13px] text-[#1C1C1C] placeholder:text-[#8E8E93] outline-none w-full"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="text-[#A0A0A0] hover:text-[#1C1C1C] p-0.5 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Search Results / Trending Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E8E8E8] shadow-xl max-h-[420px] overflow-y-auto z-[150] divide-y divide-[#F0F0F0] animate-scale-in">
          {trimmed ? (
            hasResults ? (
              <>
                {/* Matched Services */}
                {matchedServices.length > 0 && (
                  <div className="p-3 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#737373] px-2 py-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                      <span>Services ({matchedServices.length})</span>
                    </div>
                    {matchedServices.map((svc) => (
                      <div
                        key={svc.name}
                        onClick={() => handleSelectService(svc.service_category, svc.service_name)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAFAFA] cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {svc.service_image ? (
                            <img
                              src={svc.service_image}
                              alt={svc.service_name}
                              className="w-8 h-8 rounded-lg object-cover border border-[#E8E8E8] shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/service-collage.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[10px] font-bold shrink-0">
                              ⚡
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-[13px] font-bold text-[#1C1C1C] group-hover:text-[#5B21B6] transition-colors truncate">
                              {svc.service_name}
                            </h4>
                            <p className="text-[11px] text-[#737373]">
                              in {svc.service_category}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#A0A0A0] group-hover:translate-x-0.5 group-hover:text-[#1C1C1C] transition-all shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Matched Packages */}
                {matchedPackages.length > 0 && (
                  <div className="p-3 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#737373] px-2 py-1 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-[#059669]" />
                      <span>Packages ({matchedPackages.length})</span>
                    </div>
                    {matchedPackages.map((pkg) => {
                      const basePrice = Number(pkg.base_price || 0);
                      const discountPrice = Number(pkg.discount_price || 0);
                      const displayPrice = discountPrice > 0 ? discountPrice : basePrice;

                      return (
                        <div
                          key={pkg.name}
                          onClick={() => handleSelectPackage(pkg.pack_name)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAFAFA] cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {pkg.package_image ? (
                              <img
                                src={pkg.package_image}
                                alt={pkg.pack_name}
                                className="w-8 h-8 rounded-lg object-cover border border-[#E8E8E8] shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/service-collage.jpg';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[10px] font-bold shrink-0">
                                📦
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-[13px] font-bold text-[#1C1C1C] group-hover:text-[#5B21B6] transition-colors truncate">
                                {pkg.pack_name}
                              </h4>
                              <p className="text-[11px] text-[#737373]">
                                {pkg.service_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <div className="text-[13px] font-bold text-[#1C1C1C]">
                              ₹{displayPrice.toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                              ★ 4.8
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center space-y-2">
                <p className="text-[13px] font-medium text-[#1C1C1C]">
                  No services found for "{query}"
                </p>
                <p className="text-[11px] text-[#737373]">
                  Try searching for "Cleaning", "Painting", or "Pest Control"
                </p>
              </div>
            )
          ) : (
            /* Trending / Popular Searches */
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleTrendingClick(term)}
                    className="px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#E8E8E8] text-[#1C1C1C] text-[12px] font-medium rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
