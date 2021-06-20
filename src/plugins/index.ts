import { deserializeModelBase } from '@app/model-helpers';
import {
  ApiPluginReponse,
  PluginClient,
  PluginResponse,
  State,
} from '@app/types';
import { createReducerMap, createTable, MapEntity } from 'robodux';
import { api, ApiCtx } from '@app/api';

export const defaultPlugin = (p: Partial<PluginClient> = {}): PluginClient => {
  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    description: '',
    createdAt: now,
    updatedAt: now,
    ...p,
  };
};

const deserializePlugin = (p: PluginResponse): PluginClient => {
  return {
    ...deserializeModelBase(p),
    id: p.id,
    name: p.name,
    description: p.description,
  };
};

export const processPlugins = (plugins: PluginResponse[]) => {
  return plugins.reduce<MapEntity<PluginClient>>((acc, plugin) => {
    acc[plugin.id] = deserializePlugin(plugin);
    return acc;
  }, {});
};

export const PLUGIN_SLICE = 'plugins';
const slice = createTable<PluginClient>({ name: PLUGIN_SLICE });
export const reducers = createReducerMap(slice);
const { set: setPlugins } = slice.actions;
export const {
  selectTable: selectPlugins,
  selectTableAsList: selectPluginsAsList,
} = slice.getSelectors((state: State) => state[PLUGIN_SLICE] || {});

export const fetchPlugins = api.get('/plugins', function* (
  ctx: ApiCtx<ApiPluginReponse>,
  next,
) {
  yield next();
  if (!ctx.response.ok) return;
  const plugins = processPlugins(ctx.response.data.plugins);
  ctx.actions.push(setPlugins(plugins));
});
