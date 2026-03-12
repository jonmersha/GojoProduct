export type UserRole = 'buyer' | 'seller' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location_lat?: number;
  location_lng?: number;
  storeName?: string;
  bio?: string;
  phone?: string;
  address?: string;
  vehicleType?: string;
  rating?: number;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  availability: boolean;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  delivery_id?: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  buyer_name?: string;
  seller_name?: string;
  delivery_name?: string;
  delivery_address?: string;
  items?: string; // JSON string of OrderItem[]
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}
