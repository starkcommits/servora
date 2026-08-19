import { useFrappeGetCall, useFrappeEventListener } from 'frappe-react-sdk';
import { BookingDetails } from '../types';

export function useBookingDetails(bookingId?: string) {
  const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: BookingDetails }>(
    'servora.api.get_booking_details',
    bookingId ? { booking_id: bookingId } : undefined,
    bookingId ? `booking_details_${bookingId}` : null,
    {
      revalidateOnFocus: true,
    }
  );

  useFrappeEventListener('booking_updated', (event: any) => {
    if (event.booking_id === bookingId) {
      mutate();
    }
  });

  return {
    details: data?.message || null,
    booking: data?.message?.booking || null,
    isLoading,
    error,
    refetch: mutate,
  };
}
