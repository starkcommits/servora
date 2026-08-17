import { useFrappeGetDocList, useFrappeGetDoc } from 'frappe-react-sdk';
import { ServicePackage } from '../types';

export function useServicePackages(serviceName?: string) {
  const filters: [string, '=' | '!=', string | number][] = [['is_active', '=', 1]];
  if (serviceName) {
    filters.push(['service_name', '=', serviceName]);
  }

  const { data, error, isLoading, mutate } = useFrappeGetDocList<ServicePackage>(
    'Service Package',
    {
      fields: ['name', 'pack_name', 'service_name', 'base_price', 'discount_price', 'description', 'is_active', 'package_image'],
      filters: filters as any,
      orderBy: { field: 'discount_price', order: 'asc' },
      limit: 100,
    },
    serviceName ? `packages_${serviceName}` : 'all_packages',
    {
      revalidateOnFocus: false,
    }
  );

  return {
    packages: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useServicePackage(packageName: string) {
  const { data, error, isLoading, mutate } = useFrappeGetDoc<ServicePackage>(
    'Service Package',
    packageName,
    packageName ? `package_${packageName}` : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    packageDoc: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
