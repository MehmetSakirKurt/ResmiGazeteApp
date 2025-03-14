import { GazettePublication } from '../types';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  PublicationDetail: { publication: GazettePublication };
  CategoryList: undefined;
  Search: undefined;
  ChatDetail: { conversationId?: string; initialQuestion?: string };
  Settings: undefined;
  Notifications: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Search: undefined;
  ChatAssistant: undefined;
  Profile: undefined;
};
