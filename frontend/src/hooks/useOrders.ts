import { useFrappeGetDocList, useFrappeAuth } from 'frappe-react-sdk';
import { Order } from '../types';

export function useOrders() {
  const { currentUser } = useFrappeAuth();

  const { data, error, isLoading, mutate } = useFrappeGetDocList<Order>(
    'Order',
    {
      fields: ['name', 'workflow_state', 'grand_total', 'platform_fee', 'scheduled_at', 'creation', 'payment_mode'],
      filters: [
        ['owner', '=', currentUser || ''],
        ['workflow_state', '!=', 'Draft']
      ],
      orderBy: { field: 'creation', order: 'desc' },
      limit: 100,
    },
    currentUser ? `orders_${currentUser}` : null,
    {
      revalidateOnFocus: true,
    }
  );

  return {
    orders: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
