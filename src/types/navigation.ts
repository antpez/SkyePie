import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  '(tabs)': NavigatorScreenParams<TabParamList>;
  '(auth)': NavigatorScreenParams<AuthParamList>;
  'permissions': undefined;
  'not-found': undefined;
};

export type TabParamList = {
  index: undefined;
  search: undefined;
  settings: undefined;
};

export type AuthParamList = {
  permissions: undefined;
};

export type RootTabParamList = {
  Weather: undefined;
  Search: undefined;
  Settings: undefined;
};

export type WeatherScreenProps = {
  navigation: any;
  route: any;
};

export type SearchScreenProps = {
  navigation: any;
  route: any;
};

export type SettingsScreenProps = {
  navigation: any;
  route: any;
};

export type PermissionScreenProps = {
  navigation: any;
  route: any;
};
