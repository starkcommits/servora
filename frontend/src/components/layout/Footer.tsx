import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    /* UC Footer: plain white or very light gray, black text, minimal */
    <footer className="bg-[#FAFAFA] border-t border-[#E8E8E8] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#1C1C1C] flex items-center justify-center">
                <span className="text-white text-xs font-black">S</span>
              </div>
              <span className="text-[14px] font-bold text-[#1C1C1C]">Servora</span>
            </Link>
            <p className="text-[13px] text-[#737373] leading-relaxed">
              Professional home services at your doorstep. Cleaning, painting, pest control and more.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1C1C1C] mb-4">Services</h4>
            <ul className="space-y-2.5">
              {['Home Cleaning', 'Deep Cleaning', 'Painting', 'Waterproofing', 'Pest Control'].map(s => (
                <li key={s}>
                  <Link to={`/services/${s}`} className="text-[13px] text-[#737373] hover:text-[#1C1C1C] transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1C1C1C] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {['About Us', 'Careers', 'Partner with Us', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <a href="#" className="text-[13px] text-[#737373] hover:text-[#1C1C1C] transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1C1C1C] mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-[13px] text-[#737373]">
                <Phone className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>+91 1800-SERVORA</span>
              </li>
              <li className="flex items-start gap-2.5 text-[13px] text-[#737373]">
                <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>support@servora.in</span>
              </li>
              <li className="flex items-start gap-2.5 text-[13px] text-[#737373]">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Bengaluru, Karnataka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E8E8E8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#A0A0A0]">
            © {new Date().getFullYear()} Servora Home Services. All rights reserved.
          </p>
          <p className="text-[12px] text-[#A0A0A0]">
            All professionals are background-verified
          </p>
        </div>
      </div>
    </footer>
  );
};
