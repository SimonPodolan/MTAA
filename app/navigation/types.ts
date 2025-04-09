import { Session } from "@supabase/supabase-js";
import type { Order } from '../navigation/Order';


export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  SignUp: undefined;
  Success: undefined;
  SignIn: undefined;
  MainTabs: undefined;
  Order: undefined;
  EditProfileScreen: { session: Session };
  HistoryDetail: { order: Order };
};
