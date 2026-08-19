import { useFrappeGetCall, useFrappeAuth } from 'frappe-react-sdk';
import { CustomerProfileData } from '../types';

export function useCustomerProfile() {
  const { currentUser } = useFrappeAuth();
  
  const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: CustomerProfileData }>(
    'servora.api.get_customer_profile',
    undefined,
    currentUser && currentUser !== 'Guest' ? `profile_${currentUser}` : null,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );

  return {
    profile: data?.message || null,
    isLoading,
    error,
    refetch: mutate,
  };
}
