import { useFrappeGetCall, useFrappeAuth } from 'frappe-react-sdk';
import { Booking } from '../types';

export function useBookings() {
  const { currentUser } = useFrappeAuth();

  const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: Booking[] }>(
    'servora.api.get_customer_bookings',
    undefined,
    currentUser && currentUser !== 'Guest' ? `bookings_${currentUser}` : null,
    {
      revalidateOnFocus: true,
    }
  );

  return {
    bookings: data?.message || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
