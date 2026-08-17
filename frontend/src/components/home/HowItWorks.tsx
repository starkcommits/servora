import React from 'react';
import { MousePointerClick, Calendar, CreditCard, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose a service',
      desc: 'Browse cleaning, painting, or pest control packages with fixed upfront rates.',
      icon: <MousePointerClick className="w-5 h-5 text-[#1C1C1C]" />,
    },
    {
      step: '02',
      title: 'Select convenient slot',
      desc: 'Pick your preferred date and time starting from 30 minutes onwards.',
      icon: <Calendar className="w-5 h-5 text-[#1C1C1C]" />,
    },
    {
      step: '03',
      title: 'Pay online or COD',
      desc: 'Choose instant online payment via UPI/Cards or pay cash after service completion.',
      icon: <CreditCard className="w-5 h-5 text-[#1C1C1C]" />,
    },
    {
      step: '04',
      title: 'Doorstep service delivery',
      desc: 'Our verified expert arrives on time equipped with industrial tools and chemicals.',
      icon: <Sparkles className="w-5 h-5 text-[#1C1C1C]" />,
    },
  ];

  return (
    <section className="py-16 bg-[#FAFAFA] border-b border-[#E8E8E8]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] bg-[#E8E8E8]/60 px-2.5 py-1 rounded-md">
            Simple Process
          </span>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-[#1C1C1C] tracking-tight mt-2.5">
            How Servora Works
          </h2>
          <p className="text-[13px] text-[#737373] mt-1.5">
            Book professional doorstep home care in 4 easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-white p-6 rounded-2xl border border-[#E8E8E8] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E8E8E8] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[22px] font-extrabold text-[#D1D1D1]">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-[15px] font-bold text-[#1C1C1C] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[#737373] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
