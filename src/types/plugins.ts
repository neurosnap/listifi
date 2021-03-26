import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { Dispatch } from 'redux';
import { plugins } from './db';
import { Env } from './env';
import { ListItemClient } from './list-items';
import { ListClient } from './lists';

export type PluginResponse = plugins;

export interface ApiPluginReponse {
  plugins: PluginResponse[];
}

export interface PluginClient {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PluginOnMount {
  list: ListClient;
  env: Env;
  dispatch: Dispatch<any>;
  save: (...args: any[]) => any;
}

export interface PluginComponentProps<D = any> {
  item: ListItemClient;
  userId: string;
  data: D;
  save: (...args: any[]) => any;
}

export interface PluginTabProps {
  userId: string;
  listId: string;
}

export interface PluginActionProps<D = any> {
  userId: string;
  list: ListClient;
  data: D;
}

export interface PluginState {
  [key: string]: any;
}

export interface PluginModule {
  name: string;
  onListMount?: (p: PluginOnMount) => Promise<any>;
  PocketMenuItem?: (d: PluginComponentProps) => ReactJSXElement;
  tabMenuLabel?: string;
  TabMenu?: (d: PluginTabProps) => ReactJSXElement;
  ActionItem?: (d: PluginActionProps) => ReactJSXElement | null;
  Icon: () => ReactJSXElement;
}

export interface PluginData {
  plugins: PluginModule[];
  data: PluginState;
  createSave: (name: string) => (data: any) => any;
}
