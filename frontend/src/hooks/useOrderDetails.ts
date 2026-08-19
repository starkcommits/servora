import { useFrappeGetDoc, useFrappeEventListener } from 'frappe-react-sdk';
import { Order } from '../types';

export function useOrderDetails(orderId?: string) {
  const { data, error, isLoading, mutate } = useFrappeGetDoc<Order>(
    'Order',
    orderId || '',
    orderId ? `order_${orderId}` : null,
    {
      revalidateOnFocus: true,
    }
  );

  useFrappeEventListener('order_updated', (event: any) => {
    if (event.order_id === orderId) {
      mutate();
    }
  });

  return {
    order: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
