import { Session } from "@supabase/supabase-js";

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  SignUp: undefined;
  Success: undefined;
  SignIn: undefined;
  MainTabs: undefined;
  Order: undefined;
  EditProfileScreen: { session: Session };
};
