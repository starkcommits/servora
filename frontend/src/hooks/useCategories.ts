import { useFrappeGetDocList } from 'frappe-react-sdk';
import { ServiceCategory } from '../types';

export function useCategories() {
  const { data, error, isLoading, mutate } = useFrappeGetDocList<ServiceCategory>(
    'Service Category',
    {
      fields: ['name', 'category_name', 'status', 'category_image'],
      filters: [['status', '=', 'Active']],
      orderBy: { field: 'category_name', order: 'asc' },
      limit: 50,
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
