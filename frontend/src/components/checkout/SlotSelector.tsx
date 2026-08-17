import React, { useState, useEffect } from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { TimeSlot } from '../../types';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface SlotSelectorProps {
  selectedScheduledAt: string | null;
  onSelectSlot: (datetimeStr: string) => void;
}

// Enforce minimum +30 minutes from now
function getMinDateTime(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return d;
}

function isSlotAvailable(dateStr: string, timeStr: string): boolean {
  const [hh, mm] = timeStr.split(':').map(Number);
  const slotDate = new Date(dateStr);
  slotDate.setHours(hh, mm, 0, 0);
  return slotDate >= getMinDateTime();
}

function buildDays(count = 7) {
  return Array.from({ length: count }, (_, offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Tom' : d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    return { dateStr, dayName, dayNum, month };
  });
}

const DEFAULT_SLOTS: TimeSlot[] = [
  { id: '07:00', label: '7:00 AM – 9:00 AM', time: '07:00:00', available: true },
  { id: '09:00', label: '9:00 AM – 11:00 AM', time: '09:00:00', available: true },
  { id: '11:00', label: '11:00 AM – 1:00 PM', time: '11:00:00', available: true },
  { id: '13:00', label: '1:00 PM – 3:00 PM',  time: '13:00:00', available: true },
  { id: '15:00', label: '3:00 PM – 5:00 PM',  time: '15:00:00', available: true },
  { id: '17:00', label: '5:00 PM – 7:00 PM',  time: '17:00:00', available: true },
  { id: '19:00', label: '7:00 PM – 9:00 PM',  time: '19:00:00', available: true },
];

export const SlotSelector: React.FC<SlotSelectorProps> = ({ selectedScheduledAt, onSelectSlot }) => {
  const days = buildDays(7);
  const [selectedDate, setSelectedDate] = useState<string>(days[0].dateStr);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const { data: slotData, isLoading } = useFrappeGetCall<{ message: TimeSlot[] }>(
    'servora.api.get_available_slots',
    { date: selectedDate },
    `slots_${selectedDate}`
  );

  const rawSlots: TimeSlot[] = slotData?.message || DEFAULT_SLOTS;
  const slots = rawSlots.map(slot => ({
    ...slot,
    available: slot.available && isSlotAvailable(selectedDate, slot.time),
  }));

  // Restore from prop
  useEffect(() => {
    if (selectedScheduledAt) {
      const parts = selectedScheduledAt.split(' ');
      if (parts.length === 2) {
        setSelectedDate(parts[0]);
        setSelectedTime(parts[1]);
      }
    }
  }, [selectedScheduledAt]);

  // Clear time if it's no longer valid after date switch
  useEffect(() => {
    if (selectedTime && !isSlotAvailable(selectedDate, selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate]);

  return (
    <div className="space-y-5">

      {/* ── Date row: UC style — flat horizontal scroll of date pills */}
      <div>
        <p className="text-[12px] font-semibold text-[#737373] uppercase tracking-wide mb-3">
          Select Date
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map(d => {
            const isSelected = selectedDate === d.dateStr;
            const hasAny = DEFAULT_SLOTS.some(s => isSlotAvailable(d.dateStr, s.time));
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                disabled={!hasAny}
                className={cn(
                  'shrink-0 flex flex-col items-center justify-center w-[68px] h-[72px] rounded-xl border text-center transition-all',
                  isSelected
                    ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white'
                    : hasAny
                    ? 'border-[#E8E8E8] text-[#1C1C1C] hover:border-[#1C1C1C] bg-white'
                    : 'border-[#E8E8E8] text-[#D1D1D1] bg-[#FAFAFA] cursor-not-allowed'
                )}
              >
                <span className={cn('text-[11px] font-medium', isSelected ? 'text-white/70' : 'text-[#A0A0A0]')}>
                  {d.dayName}
                </span>
                <span className="text-[20px] font-bold leading-tight">{d.dayNum}</span>
                <span className={cn('text-[11px]', isSelected ? 'text-white/60' : 'text-[#A0A0A0]')}>
                  {d.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Time slots: UC style — grid of flat time chips */}
      <div>
        <p className="text-[12px] font-semibold text-[#737373] uppercase tracking-wide mb-3">
          Select Time
        </p>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-[#F5F5F5] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {slots.map(slot => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    if (!slot.available) return;
                    setSelectedTime(slot.time);
                    onSelectSlot(`${selectedDate} ${slot.time}`);
                  }}
                  disabled={!slot.available}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white'
                      : slot.available
                      ? 'border-[#E8E8E8] text-[#1C1C1C] hover:border-[#1C1C1C] bg-white'
                      : 'border-[#E8E8E8] text-[#D1D1D1] bg-[#FAFAFA] cursor-not-allowed'
                  )}
                >
                  <span className="text-[13px] font-medium">{slot.label.split('–')[0].trim()}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Note */}
      <p className="text-[12px] text-[#A0A0A0]">
        ⏱ Slots shown are available from 30 minutes from now.
      </p>
    </div>
  );
};
