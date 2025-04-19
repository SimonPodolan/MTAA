import { Session } from "@supabase/supabase-js";
import type { Order } from '../navigation/Order';


export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  SignUp: undefined;
  SuccessScreen: { onComplete: () => void };
  SignIn: undefined;
  MainTabs: undefined;
  Order: undefined;
  EditProfileScreen: { session: Session };
  HistoryDetail: { order: Order };
  Payment: { 
    orderDetails: Omit<Order, 'order_id' | 'status' | 'created_at'>;
  };
};
