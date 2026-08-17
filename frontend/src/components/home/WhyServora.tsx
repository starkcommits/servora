import React from 'react';
import { UserCheck, Tag, Clock, ShieldCheck, BadgePercent } from 'lucide-react';

export const WhyServora: React.FC = () => {
  const reasons = [
    {
      title: 'Trained Professionals',
      desc: 'All service providers are background-verified, trained, and equipped with industrial-grade tools.',
      icon: <UserCheck className="w-5 h-5 text-[#1C1C1C]" />,
    },
    {
      title: 'Transparent Pricing',
      desc: 'Clear upfront package pricing without any surprise add-ons or hidden charges at checkout.',
      icon: <Tag className="w-5 h-5 text-[#1C1C1C]" />,
    },
    {
      title: 'Convenient Scheduling',
      desc: 'Select precise time slots that match your busy routine, starting 30 minutes from now.',
      icon: <Clock className="w-5 h-5 text-[#1C1C1C]" />,
    },
    {
      title: 'Reliable Service Warranty',
      desc: 'Enjoy hassle-free rework and service guarantees if you are not 100% satisfied.',
      icon: <ShieldCheck className="w-5 h-5 text-[#1C1C1C]" />,
    },
    {
      title: 'No Hidden Charges',
      desc: 'Standard nominal platform fee with full clarity on GST and genuine parts.',
      icon: <BadgePercent className="w-5 h-5 text-[#1C1C1C]" />,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B21B6] bg-[#F5F3FF] px-2.5 py-1 rounded-md">
              The Servora Advantage
            </span>
            <h2 className="text-[26px] sm:text-[34px] font-bold text-[#1C1C1C] tracking-tight leading-tight">
              Why Homeowners Trust Servora
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#737373] leading-relaxed">
              We bring quality, safety, and transparent pricing to everyday home services. Experience premium doorstep home maintenance today.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="bg-white p-5 rounded-2xl border border-[#E8E8E8] shadow-sm hover:border-[#1C1C1C] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E8E8E8] flex items-center justify-center mb-3">
                  {reason.icon}
                </div>
                <h3 className="text-[14px] font-bold text-[#1C1C1C] mb-1">
                  {reason.title}
                </h3>
                <p className="text-[12px] text-[#737373] leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
