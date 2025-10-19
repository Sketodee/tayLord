export interface OrderItem {
  clothingType: string;
  quantity: number;
  measurementId?: string;
  fabric?: string;
  color?: string;
  notes?: string;
}

export interface StatusHistory {
  status: string;
  date: Date;
  notes?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  clientId: string;
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

export const priorityLevels: { value: OrderPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
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