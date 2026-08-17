import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { ServiceCategoryDialog, CATEGORY_DIALOGS, type CategoryDialogData } from './ServiceCategoryDialog';

/* ─ Category cards in hero grid ─ */
const CATEGORIES = [
  {
    key: 'Home Cleaning',
    label: 'Home\nCleaning',
    icon: '/files/icon-cleaning.jpg',
  },
  {
    key: 'Painting',
    label: 'Painting &\nWaterproofing',
    icon: '/files/icon-painting.jpg',
  },
  {
    key: 'Pest Control',
    label: 'Pest\nControl',
    icon: '/files/icon-pestcontrol.jpg',
  },
];

const TRUST_STATS = [
  { value: '50K+', label: 'Customers served' },
  {
    value: '4.8',
    label: 'Average rating',
    icon: <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B] inline -mt-0.5 mr-0.5" />,
  },
  { value: '500+', label: 'Expert professionals' },
];

export const HeroBanner: React.FC = () => {
  const [activeDialog, setActiveDialog] = useState<CategoryDialogData | null>(null);

  const handleCategoryClick = (key: string) => {
    setActiveDialog(CATEGORY_DIALOGS[key] ?? null);
  };

  return (
    <>
      {/* ── Hero section ── */}
      <section className="bg-white border-b border-[#E8E8E8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-[520px] items-stretch">

            {/* ── LEFT: heading + category grid ── */}
            <div className="py-10 lg:py-14 pr-0 lg:pr-12 flex flex-col justify-center">

              {/* Heading — pure black, no colored words */}
              <h1 className="text-[2.4rem] sm:text-[2.8rem] lg:text-[3rem] font-extrabold text-[#1C1C1C] leading-[1.1] tracking-[-0.02em] mb-3">
                Home services at<br />your doorstep
              </h1>

              <p className="text-[15px] text-[#737373] mb-8 leading-relaxed max-w-[460px]">
                Book from 100+ verified home service professionals.<br />
                Quality guaranteed, transparent pricing.
              </p>

              {/*
               * UC-style category grid:
               * White card with hairline border, 3 illustrated icon categories.
               * Clicking each opens a sub-service dialog.
               */}
              <div className="border border-[#E8E8E8] rounded-2xl bg-white p-4 max-w-[440px]">
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => handleCategoryClick(cat.key)}
                      className="flex flex-col items-center gap-2.5 p-3 rounded-xl hover:bg-[#F5F5F5] active:bg-[#EBEBEB] transition-colors group text-center"
                    >
                      {/* Illustrated icon image */}
                      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-[#FAFAFA] border border-[#F0F0F0]">
                        <img
                          src={cat.icon}
                          alt={cat.key}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Label — UC: small, medium weight, near-black */}
                      <span className="text-[12px] font-medium text-[#404040] leading-tight group-hover:text-[#1C1C1C] whitespace-pre-line">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust stats */}
              <div className="flex items-center gap-6 mt-7">
                {TRUST_STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-[15px] font-bold text-[#1C1C1C] flex items-center">
                      {s.icon}
                      {s.value}
                    </div>
                    <div className="text-[11px] text-[#A0A0A0]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Photo collage ── */}
            <div className="hidden lg:flex items-stretch py-6">
              <div className="w-full rounded-2xl overflow-hidden">
                <img
                  src="/files/service-collage.jpg"
                  alt="Our professional home service team"
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '480px' }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── UC-style Sub-service Dialog (portal) ── */}
      <ServiceCategoryDialog
        data={activeDialog}
        onClose={() => setActiveDialog(null)}
      />
    </>
  );
};
