// 型定義

export interface Product {
  id: string;
  name: string;
  volume: string;
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
}

export interface Order {
  customerId: string;
  customerName: string;
  items: OrderItem[];
  freeInputItems: FreeInputItem[];
}
