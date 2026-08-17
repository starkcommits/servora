import { useState, useEffect, useCallback } from 'react';
import { useFrappeAuth, useFrappePostCall } from 'frappe-react-sdk';
import { CustomerProfileData } from '../types';

export function useCustomerProfile() {
  const { currentUser } = useFrappeAuth();
  const [profile, setProfile] = useState<CustomerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { call: getProfileCall } = useFrappePostCall('servora.api.get_customer_profile');

  const fetchProfile = useCallback(async () => {
    if (!currentUser || currentUser === 'Guest') {
      setProfile(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await getProfileCall({});
      if (res && res.message) {
        setProfile(res.message);
      }
    } catch (err: any) {
      console.error('Failed to fetch customer profile:', err);
      setError('Unable to load profile data.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, getProfileCall]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
