// app/types/order.ts

export interface OrderItem {
  _id?: string;
  clothingType: string;
  quantity: number;
  measurementId?: string;
  fabric?: string;
  color?: string;
  notes?: string;
  // NEW: Pricing fields
  unitPrice?: number;
  totalPrice?: number;
}

export interface StatusHistory {
  status: string;
  date: Date;
  notes?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  clientId: string | {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  designerId: string;
  title: string;
  description?: string;
  items: OrderItem[];
  status: OrderStatus;
  priority: OrderPriority;
  orderDate: Date;
  deliveryDate: Date;
  completedDate?: Date;
  statusHistory: StatusHistory[];
  images: string[];
  notes?: string;
  trackingToken: string;
  // NEW: Pricing fields
  currency?: string;
  subtotal?: number;
  vatRate?: number;
  vatAmount?: number;
  discount?: number;
  totalAmount?: number;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending'
  | 'measurements_taken'
  | 'fabric_sourced'
  | 'cutting'
  | 'in_progress'
  | 'fitting'
  | 'alterations'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

// Keep the original export name for backward compatibility
export const orderStatuses: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'measurements_taken', label: 'Measurements Taken', color: 'blue' },
  { value: 'fabric_sourced', label: 'Fabric Sourced', color: 'indigo' },
  { value: 'cutting', label: 'Cutting', color: 'purple' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'fitting', label: 'Fitting', color: 'orange' },
  { value: 'alterations', label: 'Alterations', color: 'pink' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'delivered', label: 'Delivered', color: 'teal' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

// Alternative export name
export const statusOptions = orderStatuses;

// Keep the original export name for backward compatibility  
export const priorityLevels: { value: OrderPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

export const paymentStatusOptions: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'unpaid', label: 'Unpaid', color: 'red' },
  { value: 'partial', label: 'Partially Paid', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
];

export const currencyOptions = [
  { value: 'NGN', label: 'NGN - Nigerian Naira', symbol: '₦' },
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
];

export interface BusinessProfile {
  _id: string;
  userId: string;
  businessName: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt: Date;
  updatedAt: Date;
}