import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Service } from '../types';

export function useServices(categoryName?: string) {
  const filters: [string, '=' | '!=', string][] = [];
  if (categoryName) {
    filters.push(['service_category', '=', categoryName]);
  }

  const { data, error, isLoading, mutate } = useFrappeGetDocList<Service>(
    'Service',
    {
      fields: ['name', 'service_name', 'service_category', 'description', 'service_image'],
      filters: filters.length > 0 ? (filters as any) : undefined,
      orderBy: { field: 'service_name', order: 'asc' },
      limit: 100,
    },
    categoryName || 'all_services',
    {
      revalidateOnFocus: false,
    }
  );

  return {
    services: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
