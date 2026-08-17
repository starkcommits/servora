import React from 'react';
import { ShieldCheck, Check, Sparkles } from 'lucide-react';

export const ServoraPromiseCard: React.FC = () => {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-bold text-[#1C1C1C]">Servora Promise</h3>
          <p className="text-[11px] text-[#737373]">Your satisfaction is our priority</p>
        </div>
        {/* Quality Assured Badge */}
        <div className="w-10 h-10 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 text-[12px] text-[#404040]">
          <div className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" strokeWidth={3} />
          </div>
          <span>Verified & Trained Professionals</span>
        </div>

        <div className="flex items-center gap-2.5 text-[12px] text-[#404040]">
          <div className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" strokeWidth={3} />
          </div>
          <span>Hassle-Free Doorstep Booking</span>
        </div>

        <div className="flex items-center gap-2.5 text-[12px] text-[#404040]">
          <div className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" strokeWidth={3} />
          </div>
          <span>Transparent & Fixed Pricing</span>
        </div>

        <div className="flex items-center gap-2.5 text-[12px] text-[#404040]">
          <div className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <span>30-Day Service Guarantee</span>
        </div>
      </div>
    </div>
  );
};
