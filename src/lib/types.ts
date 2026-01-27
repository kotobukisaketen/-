// 型定義

export interface Product {
  id: string;
  name: string;
  volume: string;
  display_order?: number;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  products: Product[];
}

export interface OrderItem {
  product: Product;
  quantity: number;
  unit: 'バラ' | 'ケース';
}

export interface FreeInputItem {
  description: string;
  quantity: number;
  volume?: string;
  unit?: 'バラ' | 'ケース';
}

export interface Order {
  customerId: string;
  customerName: string;
  items: OrderItem[];
  freeInputItems: FreeInputItem[];
  deliveryDate?: string;
}
