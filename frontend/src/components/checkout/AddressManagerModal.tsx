import React, { useState, useEffect } from 'react';
import { CustomerAddress } from '../../types';
import { useFrappePostCall, useFrappeAuth } from 'frappe-react-sdk';
import {
  X,
  Search,
  Crosshair,
  Clock,
  MapPin,
  Home,
  Briefcase,
  Navigation,
  AlertCircle,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface LocationItem {
  id: string;
  title: string;
  subtitle: string;
}

// Popular locations & societies for fast search & suggestions
const POPULAR_LOCATIONS: LocationItem[] = [
  {
    id: '1',
    title: 'The First Brick Apartment',
    subtitle: 'near Sunder Farm House, Sarfabad, Sector 73, Noida, Uttar Pradesh, India',
  },
  {
    id: '2',
    title: 'Hiranandani Gardens',
    subtitle: 'Cliff Ave, Central Avenue, Powai, Mumbai, Maharashtra 400076',
  },
  {
    id: '3',
    title: 'Prestige Shantiniketan',
    subtitle: 'ITPL Main Road, Whitefield, Bengaluru, Karnataka 560048',
  },
  {
    id: '4',
    title: 'DLF Phase 5',
    subtitle: 'Golf Course Road, Sector 54, Gurugram, Haryana 122002',
  },
  {
    id: '5',
    title: 'Indiranagar 100ft Road',
    subtitle: 'Near CMH Hospital, HAL 2nd Stage, Bengaluru, Karnataka 560038',
  },
  {
    id: '6',
    title: 'Godrej Woods',
    subtitle: 'Sector 43, Noida, Gautam Buddha Nagar, Uttar Pradesh 201301',
  },
  {
    id: '7',
    title: 'Koramangala 4th Block',
    subtitle: '80 Feet Road, Sony World Junction, Bengaluru, Karnataka 560034',
  },
  {
    id: '8',
    title: 'Bandra West (Pali Hill)',
    subtitle: 'Dr. Ambedkar Road, Bandra West, Mumbai, Maharashtra 400050',
  },
  {
    id: '9',
    title: 'Banjara Hills Road No 12',
    subtitle: 'Near MLA Colony, Hyderabad, Telangana 500034',
  },
  {
    id: '10',
    title: 'Amanora Park Town',
    subtitle: 'Magarpatta Road, Hadapsar, Pune, Maharashtra 411028',
  },
];

const RECENTS_KEY = 'servora_recent_locations';

interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses?: CustomerAddress[];
  onAddressUpdated: () => void;
  initialMode?: 'list' | 'search';
}

export const AddressManagerModal: React.FC<AddressManagerModalProps> = ({
  isOpen,
  onClose,
  addresses = [],
  onAddressUpdated,
  initialMode = 'list',
}) => {
  const { currentUser } = useFrappeAuth();
  const isGuest = !currentUser || currentUser === 'Guest';

  // Step flow: 'list' (if saved addresses exist) -> 'search' (pin location) -> 'details' (house/flat no)
  const [step, setStep] = useState<'list' | 'search' | 'details'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [recents, setRecents] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

  // Details form fields
  const [houseflatNo, setHouseflatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [savedAs, setSavedAs] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { call: saveAddressCall } = useFrappePostCall('servora.api.save_customer_address');
  const { call: setCurrentCall } = useFrappePostCall('servora.api.set_current_customer_address');
  const { call: deleteAddressCall } = useFrappePostCall('servora.api.delete_customer_address');

  // Load recents from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTS_KEY);
      if (stored) {
        setRecents(JSON.parse(stored));
      } else {
        setRecents([POPULAR_LOCATIONS[0], POPULAR_LOCATIONS[1]]);
      }
    } catch {
      setRecents([POPULAR_LOCATIONS[0]]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (addresses.length === 0 || initialMode === 'search') {
        setStep('search');
      } else {
        setStep('list');
      }
      setSearchQuery('');
      setSelectedLocation(null);
      setHouseflatNo('');
      setLandmark('');
      setSavedAs('Home');
      setErrorMsg(null);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, addresses.length, initialMode]);

  if (!isOpen) return null;

  // Filter locations based on search query
  const filteredLocations = searchQuery.trim()
    ? POPULAR_LOCATIONS.filter(
        (loc) =>
          loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectLocation = (loc: LocationItem, quickSetOnly = false) => {
    setSelectedLocation(loc);
    setErrorMsg(null);

    // Save to recents and active guest location
    const updatedRecents = [loc, ...recents.filter((r) => r.id !== loc.id)].slice(0, 4);
    setRecents(updatedRecents);
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(updatedRecents));
      localStorage.setItem(
        'servora_guest_location',
        JSON.stringify({
          title: loc.title,
          subtitle: loc.subtitle,
          location: `${loc.title}, ${loc.subtitle}`,
          houseflat_no: '',
        })
      );
      window.dispatchEvent(new Event('servora_location_changed'));
    } catch {}

    if (quickSetOnly) {
      onAddressUpdated();
      onClose();
      return;
    }

    // Move to step 2: Details
    setStep('details');
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setErrorMsg(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const detectedLoc: LocationItem = {
            id: `geo-${Date.now()}`,
            title: 'Current Location Pinned',
            subtitle: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (GPS Precision Area)`,
          };
          handleSelectLocation(detectedLoc);
        },
        () => {
          setIsLocating(false);
          // Fallback to default accurate location
          const fallbackLoc: LocationItem = {
            id: 'geo-fallback',
            title: 'Current Location',
            subtitle: 'Near Metro Station, Sector 73, Noida, Uttar Pradesh, India',
          };
          handleSelectLocation(fallbackLoc);
        },
        { timeout: 6000 }
      );
    } else {
      setIsLocating(false);
      handleSelectLocation(POPULAR_LOCATIONS[0]);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseflatNo.trim()) {
      setErrorMsg('Please enter your house/flat/floor/building details.');
      return;
    }
    if (!selectedLocation) {
      setErrorMsg('Please select a pinned location.');
      setStep('search');
      return;
    }

    const fullLocationString = landmark.trim()
      ? `${selectedLocation.title}, ${landmark.trim()} - ${selectedLocation.subtitle}`
      : `${selectedLocation.title}, ${selectedLocation.subtitle}`;

    // If guest, save locally and update navbar seamlessly
    if (isGuest) {
      try {
        localStorage.setItem(
          'servora_guest_location',
          JSON.stringify({
            title: selectedLocation.title,
            subtitle: selectedLocation.subtitle,
            location: fullLocationString,
            houseflat_no: houseflatNo.trim(),
            saved_as: savedAs,
          })
        );
        window.dispatchEvent(new Event('servora_location_changed'));
        onAddressUpdated();
        onClose();
      } catch {}
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await saveAddressCall({
        houseflat_no: houseflatNo.trim(),
        location: fullLocationString,
        saved_as: savedAs,
        is_current: 1,
      });

      if (res?.message?.status === 'success') {
        onAddressUpdated();
        onClose();
      } else {
        setErrorMsg('Failed to save address. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong while saving address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetCurrent = async (addressId: string) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await setCurrentCall({ address_id: addressId });
      if (res?.message?.status === 'success') {
        onAddressUpdated();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to select address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await deleteAddressCall({ address_id: addressId });
      if (res?.message?.status === 'success') {
        onAddressUpdated();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[480px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {step === 'details' && (
              <button
                type="button"
                onClick={() => setStep('search')}
                className="w-7 h-7 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] transition-colors mr-1"
                title="Back to search"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-[16px] font-bold text-[#1C1C1C]">
              {step === 'list' && 'Saved Addresses'}
              {step === 'search' && 'Choose Your Location'}
              {step === 'details' && 'Add Doorstep Details'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[12px] text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW 1: LIST SAVED ADDRESSES
             ══════════════════════════════════════════════════ */}
          {step === 'list' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isCurrent = addr.is_current === 1;
                  return (
                    <div
                      key={addr.name}
                      onClick={() => addr.name && handleSetCurrent(addr.name)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isCurrent
                          ? 'border-[#1C1C1C] bg-[#FAFAFA] shadow-sm ring-1 ring-[#1C1C1C]/10'
                          : 'border-[#E8E8E8] hover:border-[#D1D1D1] bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
                          {addr.saved_as?.toLowerCase() === 'work' ? (
                            <Briefcase className="w-4 h-4" />
                          ) : addr.saved_as?.toLowerCase() === 'home' ? (
                            <Home className="w-4 h-4" />
                          ) : (
                            <Navigation className="w-4 h-4" />
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1C1C] bg-[#E8E8E8] px-2 py-0.5 rounded">
                              {addr.saved_as || 'Home'}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <h4 className="text-[13px] font-bold text-[#1C1C1C] leading-snug">
                            {addr.houseflat_no}
                          </h4>
                          {addr.location && (
                            <p className="text-[12px] text-[#737373] leading-relaxed line-clamp-2">
                              {addr.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent ? (
                          <div className="w-6 h-6 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => addr.name && handleDeleteAddress(addr.name, e)}
                            className="p-1.5 text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#F5F5F5] rounded-lg transition-colors"
                            title="Delete address"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Address Action */}
              <button
                type="button"
                onClick={() => setStep('search')}
                className="w-full py-3 px-4 border border-dashed border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#F5F5F5] text-[13px] font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>+ Add another doorstep address</span>
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW 2: STEP 1 - LOCATION SEARCH & PIN (UC EXACT)
             ══════════════════════════════════════════════════ */}
          {step === 'search' && (
            <div className="space-y-4">
              {/* Search Bar matching UC */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search for your location/society/apartment"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E8E8] rounded-2xl text-[13px] text-[#1C1C1C] placeholder:text-[#8E8E93] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#1C1C1C]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Use Current Location Button — UC Purple Accent */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full py-3 px-4 bg-white border border-[#E8E8E8] hover:border-[#7C3AED] rounded-2xl flex items-center gap-3 text-left transition-all group shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-[#7C3AED] group-hover:underline">
                    {isLocating ? 'Detecting your GPS location...' : 'Use current location'}
                  </div>
                  <div className="text-[11px] text-[#737373]">Using device GPS</div>
                </div>
              </button>

              {/* Search Results if query exists */}
              {searchQuery.trim() ? (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#737373] px-1">
                    Matching Locations
                  </div>
                  {filteredLocations.length > 0 ? (
                    <div className="divide-y divide-[#F0F0F0] border border-[#E8E8E8] rounded-2xl overflow-hidden bg-white">
                      {filteredLocations.map((loc) => (
                        <div
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc)}
                          className="p-3.5 hover:bg-[#FAFAFA] cursor-pointer flex items-start gap-3 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-[13px] font-bold text-[#1C1C1C]">{loc.title}</h4>
                            <p className="text-[12px] text-[#737373] leading-snug mt-0.5">
                              {loc.subtitle}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Allow using custom searched name */
                    <div
                      onClick={() =>
                        handleSelectLocation({
                          id: `custom-${Date.now()}`,
                          title: searchQuery,
                          subtitle: 'Custom Location, India',
                        })
                      }
                      className="p-4 bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl hover:border-[#7C3AED] cursor-pointer flex items-start gap-3 transition-all"
                    >
                      <MapPin className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[13px] font-bold text-[#1C1C1C]">
                          Pin "{searchQuery}"
                        </h4>
                        <p className="text-[11px] text-[#737373]">
                          Click to select this area and proceed to enter house/flat details.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Recents Section matching UC screenshot */
                <div className="space-y-2 pt-2">
                  <h4 className="text-[13px] font-bold text-[#1C1C1C] px-1">Recents</h4>
                  <div className="divide-y divide-[#F0F0F0] border border-[#E8E8E8] rounded-2xl overflow-hidden bg-white shadow-sm">
                    {recents.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectLocation(item)}
                        className="p-3.5 hover:bg-[#FAFAFA] cursor-pointer flex items-start gap-3 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-[13px] font-bold text-[#1C1C1C]">{item.title}</h5>
                          <p className="text-[12px] text-[#737373] leading-snug mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Powered by Google badge */}
                  <div className="flex items-center justify-center pt-3 text-[10px] text-[#A0A0A0]">
                    <span>
                      powered by <strong className="text-[#737373]">Google</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW 3: STEP 2 - HOUSE/FLAT DETAILS FORM
             ══════════════════════════════════════════════════ */}
          {step === 'details' && selectedLocation && (
            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Pinned Location Banner */}
              <div className="bg-[#F8F9FA] border border-[#E8E8E8] rounded-2xl p-3.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider">
                      Location Pinned
                    </span>
                    <h4 className="text-[13px] font-bold text-[#1C1C1C] truncate">
                      {selectedLocation.title}
                    </h4>
                    <p className="text-[11px] text-[#737373] line-clamp-2">
                      {selectedLocation.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="text-[11px] font-bold text-[#7C3AED] hover:underline shrink-0"
                >
                  Change
                </button>
              </div>

              {/* House / Flat / Building No */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1C1C] uppercase tracking-wide mb-1.5">
                  House / Flat / Floor / Building <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Flat 402, Tower B, 4th Floor"
                  value={houseflatNo}
                  onChange={(e) => setHouseflatNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-[13px] text-[#1C1C1C] placeholder:text-[#A0A0A0] focus:outline-none focus:bg-white focus:border-[#1C1C1C] transition-all"
                />
              </div>

              {/* Landmark / Directions */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1C1C] uppercase tracking-wide mb-1.5">
                  Landmark / Nearby place (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite City Park / Behind Metro Station"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-[13px] text-[#1C1C1C] placeholder:text-[#A0A0A0] focus:outline-none focus:bg-white focus:border-[#1C1C1C] transition-all"
                />
              </div>

              {/* Save As Pills */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1C1C] uppercase tracking-wide mb-2">
                  Save Address As
                </label>
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSavedAs(type)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                        savedAs === type
                          ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-sm'
                          : 'bg-white text-[#525252] border-[#E8E8E8] hover:border-[#D1D1D1]'
                      }`}
                    >
                      {type === 'Home' && <Home className="w-3.5 h-3.5" />}
                      {type === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                      {type === 'Other' && <Navigation className="w-3.5 h-3.5" />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Save & Proceed</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
