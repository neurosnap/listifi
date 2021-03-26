import { selectUser } from '@app/token';
import { ListItemClient, PluginData } from '@app/types';
import { Box } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';

export function PocketMenuPlugins({
  item,
  pluginData,
}: {
  item: ListItemClient;
  pluginData: PluginData;
}) {
  const user = useSelector(selectUser);
  return (
    <Box>
      {pluginData.plugins.map((plugin) => {
        if (!plugin.PocketMenuItem) {
          return null;
        }

        const updateData = pluginData.createSave(plugin.name);
        return (
          <plugin.PocketMenuItem
            key={plugin.name}
            item={item}
            userId={user.id}
            data={pluginData.data[plugin.name] || {}}
            save={updateData}
          />
        );
      })}
    </Box>
  );
}
