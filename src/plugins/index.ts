import { apiFetch, ApiFetchResponse } from '@app/fetch';
import { deserializeModelBase } from '@app/model-helpers';
import {
  ApiPluginReponse,
  PluginClient,
  PluginResponse,
  State,
} from '@app/types';
import { call, createEffects, put } from 'redux-cofx';
import { createReducerMap, createTable, MapEntity } from 'robodux';

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

export function* onFetchPlugins() {
  const res: ApiFetchResponse<ApiPluginReponse> = yield call(
    apiFetch,
    '/plugins',
  );
  if (!res.ok) {
    return;
  }

  const plugins = processPlugins(res.data.plugins);
  yield put(setPlugins(plugins));
}

export const { fetchPlugins } = createEffects({
  fetchPlugins: onFetchPlugins,
});
