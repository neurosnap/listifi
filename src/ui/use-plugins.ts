import { selectEnv } from '@app/env';
import { selectPlugins } from '@app/plugins';
import {
  ListClient,
  PluginClient,
  PluginData,
  PluginModule,
  PluginState,
} from '@app/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { excludesFalse } from 'robodux';
import { SuggestionPlugin, VotingPlugin } from './plugins';

const plugins = [VotingPlugin, SuggestionPlugin];

type PluginInfo = PluginModule & PluginClient;

export function usePluginInfo(list: ListClient): PluginInfo[] {
  const listPlugins = useSelector(selectPlugins);
  return list.plugins
    .map((pluginName) => {
      const data = listPlugins[pluginName];
      if (!data) {
        return;
      }
      const feData = plugins.find((p) => p.name === pluginName);
      if (!feData) {
        return;
      }
      return { ...data, ...feData };
    })
    .filter(excludesFalse);
}

export function usePlugins(list: ListClient): PluginData {
  const env = useSelector(selectEnv);
  const dispatch = useDispatch();
  const [pluginState, setPluginState] = useState<PluginState>({});
  const activePlugins: PluginModule[] = useMemo(() => {
    return plugins.filter((plug) => list.plugins.includes(plug.name));
  }, [list]);
  const createSave = useCallback(
    (name: string) => (data: any) => setPluginState({ [name]: data }),
    [],
  );

  useEffect(() => {
    list.plugins.forEach((pluginEnabled) => {
      const foundPlugin = activePlugins.find((p) => p.name === pluginEnabled);
      if (!foundPlugin) {
        return;
      }
      const save = (data: any) => {
        setPluginState({ [pluginEnabled]: data });
      };
      if (foundPlugin.onListMount) {
        foundPlugin
          .onListMount({ list, env, save, dispatch })
          .catch(console.error);
      }
    });
  }, [list.id]);

  return { data: pluginState, plugins: activePlugins, createSave };
}
