export interface ServiceCategory {
  name: string;
  category_name: string;
  status: 'Active' | 'Inactive';
  category_image?: string;
}

export interface Service {
  name: string;
  service_name: string;
  service_category: string;
  description: string | null;
  service_image?: string;
}

export interface ServicePackage {
  name: string;
  pack_name: string;
  service_name: string;
  base_price: number;
  discount_price: number;
  description: string | null;
  is_active: number;
  package_image?: string;
}

export interface CartItem {
  name?: string;
  service_package: string;
  service_name?: string;
  base_price?: number | string;
  discounted_price?: number | string;
  amount?: number;
}

export interface AssignedWorker {
  name: string;
  worker: string;
}

export type OrderWorkflowState =
  | 'Draft'
  | 'Payment Pending'
  | 'Confirmed'
  | 'Assigned'
  | 'On The Way'
  | 'Started'
  | 'Completed'
  | 'Customer Confirmed'
  | 'Cancelled';

export interface Order {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  workflow_state: OrderWorkflowState;
  platform_fee: number;
  grand_total: number;
  scheduled_at: string | null;
  payment_mode: 'CASH' | 'UPI' | null;
  payment_collected?: number;
  start_time?: string | null;
  finish_time?: string | null;
  items: CartItem[];
  assigned_worker?: AssignedWorker[];
}

export interface CustomerAddress {
  name?: string;
  houseflat_no: string;
  location?: string | null;
  is_current?: number;
  saved_as?: string;
}

export interface Customer {
  name: string;
  first_name: string;
  last_name?: string | null;
  full_name?: string;
  user: string;
  mobile_number: string;
  email?: string | null;
  status?: string;
  date_of_birth?: string | null;
  address?: CustomerAddress[];
}

export interface CustomerProfileStats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  refunded_orders?: number;
  saved_addresses_count?: number;
}

export interface CustomerProfileData {
  user: {
    name: string;
    email: string;
    first_name: string;
    last_name?: string | null;
    mobile_no?: string | null;
  };
  customer: Customer | null;
  stats: CustomerProfileStats;
}

export interface TimeSlot {
  id: string;
  label: string;
  time: string;
  available: boolean;
}

export interface PaymentInitResponse {
  status: 'success' | 'error';
  order_id: string;
  payment_url: string;
  workflow_state: OrderWorkflowState;
  grand_total: number;
}

export interface CodOrderResponse {
  status: 'success' | 'error';
  order_id: string;
  workflow_state: OrderWorkflowState;
  grand_total: number;
  scheduled_at: string;
  payment_mode: 'CASH';
}
