import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

/*
 * UC-style Category Dialog
 * White modal, close X, service icon grid — exactly like Urban Company's dialog
 *
 * The icons use CSS background-position to slice from a sprite sheet.
 * Each service icon image is a 2×N grid where we show individual cells.
 */

export interface SubService {
  name: string;
  /** Path to icon image — can be a sprite sheet */
  iconSrc: string;
  /** For sprite sheets: which cell (row, col) — 0-indexed, optional */
  spriteRow?: number;
  spriteCol?: number;
  /** Total cols in sprite (default 2) */
  spriteCols?: number;
  /** Total rows in sprite (default 3 for cleaning, 2 for others) */
  spriteRows?: number;
  /** Frappe Service name for navigation */
  serviceName: string;
  /** Frappe parent category for navigation */
  categoryName: string;
}

export interface CategoryDialogData {
  title: string;
  sections: {
    heading: string;
    services: SubService[];
  }[];
}

interface ServiceCategoryDialogProps {
  data: CategoryDialogData | null;
  onClose: () => void;
}

/** Render a single icon cell from a sprite sheet */
const SpriteIcon: React.FC<{
  src: string;
  row: number;
  col: number;
  totalRows: number;
  totalCols: number;
  alt: string;
  size?: number;
}> = ({ src, row, col, totalRows, totalCols, alt, size = 72 }) => {
  const bgSizeW = size * totalCols;
  const bgSizeH = size * totalRows;
  const bgPosX = -(col * size);
  const bgPosY = -(row * size);

  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${src})`,
        backgroundSize: `${bgSizeW}px ${bgSizeH}px`,
        backgroundPosition: `${bgPosX}px ${bgPosY}px`,
        backgroundRepeat: 'no-repeat',
        borderRadius: 12,
        flexShrink: 0,
      }}
    />
  );
};

export const ServiceCategoryDialog: React.FC<ServiceCategoryDialogProps> = ({ data, onClose }) => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (data) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [data]);

  if (!data) return null;

  const handleServiceClick = (service: SubService) => {
    onClose();
    // Pass both category and sub-service so ServicesPage can pre-filter
    const params = new URLSearchParams();
    if (service.serviceName) params.set('service', service.serviceName);
    navigate(`/services/${encodeURIComponent(service.categoryName)}?${params.toString()}`);
  };

  return (
    /* UC-style: dark overlay, centered white modal */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F0F0F0] sticky top-0 bg-white z-10">
          <h2 className="text-[20px] font-bold text-[#1C1C1C]">{data.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sections */}
        <div className="px-6 pb-6 pt-4 space-y-6">
          {data.sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-[14px] font-semibold text-[#1C1C1C] mb-4">{section.heading}</h3>
              <div className="grid grid-cols-4 gap-2">
                {section.services.map((service) => (
                  <button
                    key={service.name}
                    onClick={() => handleServiceClick(service)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#F0F0F0] hover:border-[#D1D1D1] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.06)] transition-all group text-center"
                  >
                    {/* Icon — sprite crop */}
                    <SpriteIcon
                      src={service.iconSrc}
                      row={service.spriteRow ?? 0}
                      col={service.spriteCol ?? 0}
                      totalRows={service.spriteRows ?? 2}
                      totalCols={service.spriteCols ?? 2}
                      alt={service.name}
                      size={64}
                    />
                    <span className="text-[11px] font-medium text-[#404040] leading-tight group-hover:text-[#1C1C1C] text-center">
                      {service.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────
 * Pre-defined category dialog data
 * Maps each category to its sub-services + icon positions
 * ──────────────────────────────────────── */
export const CATEGORY_DIALOGS: Record<string, CategoryDialogData> = {
  'Home Cleaning': {
    title: 'Home Cleaning',
    sections: [
      {
        heading: 'Choose a service',
        services: [
          {
            name: 'Bathroom Cleaning',
            iconSrc: '/files/icons-cleaning-services.jpg',
            spriteRow: 0, spriteCol: 0, spriteRows: 3, spriteCols: 2,
            serviceName: 'Washroom Cleaning',
            categoryName: 'Cleaning',
          },
          {
            name: 'Kitchen Cleaning',
            iconSrc: '/files/icons-cleaning-services.jpg',
            spriteRow: 0, spriteCol: 1, spriteRows: 3, spriteCols: 2,
            serviceName: 'Kitchen Cleaning',
            categoryName: 'Cleaning',
          },
          {
            name: 'Living & Bedroom',
            iconSrc: '/files/icons-cleaning-services.jpg',
            spriteRow: 1, spriteCol: 0, spriteRows: 3, spriteCols: 2,
            serviceName: 'Living & Bedroom Cleaning',
            categoryName: 'Cleaning',
          },
          {
            name: 'Full Home Cleaning',
            iconSrc: '/files/icons-cleaning-services.jpg',
            spriteRow: 1, spriteCol: 1, spriteRows: 3, spriteCols: 2,
            serviceName: 'Full Home Cleaning',
            categoryName: 'Cleaning',
          },
          {
            name: 'Carpet Cleaning',
            iconSrc: '/files/icons-cleaning-services.jpg',
            spriteRow: 2, spriteCol: 0, spriteRows: 3, spriteCols: 2,
            serviceName: 'Carpet Cleaning',
            categoryName: 'Cleaning',
          },
          {
            name: 'Window Cleaning',
            iconSrc: '/files/icons-cleaning-services.jpg',
            spriteRow: 2, spriteCol: 1, spriteRows: 3, spriteCols: 2,
            serviceName: 'Window Cleaning',
            categoryName: 'Cleaning',
          },
        ],
      },
    ],
  },

  'Painting': {
    title: 'Painting & Waterproofing',
    sections: [
      {
        heading: 'Choose a service',
        services: [
          {
            name: 'Wall Painting',
            iconSrc: '/files/icons-painting-services.jpg',
            spriteRow: 0, spriteCol: 0, spriteRows: 2, spriteCols: 2,
            serviceName: 'Few Walls & Rooms Painting',
            categoryName: 'Painting',
          },
          {
            name: 'Full Home Painting',
            iconSrc: '/files/icons-painting-services.jpg',
            spriteRow: 0, spriteCol: 1, spriteRows: 2, spriteCols: 2,
            serviceName: 'Full Home Painting',
            categoryName: 'Painting',
          },
          {
            name: 'Waterproofing',
            iconSrc: '/files/icons-painting-services.jpg',
            spriteRow: 1, spriteCol: 0, spriteRows: 2, spriteCols: 2,
            serviceName: 'Waterproofing',
            categoryName: 'Painting',
          },
          {
            name: 'Texture Painting',
            iconSrc: '/files/icons-painting-services.jpg',
            spriteRow: 1, spriteCol: 1, spriteRows: 2, spriteCols: 2,
            serviceName: 'Texture Painting',
            categoryName: 'Painting',
          },
        ],
      },
    ],
  },

  'Pest Control': {
    title: 'Pest Control',
    sections: [
      {
        heading: 'Choose a service',
        services: [
          {
            name: 'Cockroach Control',
            iconSrc: '/files/icons-pest-services.jpg',
            spriteRow: 0, spriteCol: 0, spriteRows: 2, spriteCols: 2,
            serviceName: 'Cockroach Control',
            categoryName: 'Pest Control',
          },
          {
            name: 'Termite Control',
            iconSrc: '/files/icons-pest-services.jpg',
            spriteRow: 0, spriteCol: 1, spriteRows: 2, spriteCols: 2,
            serviceName: 'Termite Control',
            categoryName: 'Pest Control',
          },
          {
            name: 'Ant & Bed Bugs',
            iconSrc: '/files/icons-pest-services.jpg',
            spriteRow: 1, spriteCol: 0, spriteRows: 2, spriteCols: 2,
            serviceName: 'Ant & Bed Bugs Control',
            categoryName: 'Pest Control',
          },
          {
            name: 'Rodent Control',
            iconSrc: '/files/icons-pest-services.jpg',
            spriteRow: 1, spriteCol: 1, spriteRows: 2, spriteCols: 2,
            serviceName: 'Rodent Control',
            categoryName: 'Pest Control',
          },
        ],
      },
    ],
  },
};
