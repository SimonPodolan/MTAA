export interface Order {
  order_id: number;
  user_id: string;
  location: string;
  fuel_type: string;
  amount: number;
  company: string;
  price_per_liter: number;
  price: number;
  status: string;
  created_at: string;
  estimated_completion_time: string;
}
