import { useFrappeGetDoc } from 'frappe-react-sdk';
import { Order } from '../types';

export function useOrderDetails(orderId?: string) {
  const { data, error, isLoading, mutate } = useFrappeGetDoc<Order>(
    'Order',
    orderId || '',
    orderId ? `order_${orderId}` : null,
    {
      revalidateOnFocus: true,
      refreshInterval: 10000, // auto poll every 10s for live workflow tracking updates
    }
  );

  return {
    order: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
