import { selectUser } from '@app/token';
import { ListClient, PluginData } from '@app/types';
import { Box } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';

export const ActionPlugins = ({
  pluginData,
  list,
}: {
  pluginData: PluginData;
  list: ListClient;
}) => {
  const user = useSelector(selectUser);
  return (
    <Box mt={4}>
      {pluginData.plugins.map((plugin) => {
        if (!plugin.ActionItem) {
          return null;
        }

        return (
          <plugin.ActionItem
            key={plugin.name}
            userId={user.id}
            list={list}
            data={pluginData.data[plugin.name] || {}}
          />
        );
      })}
    </Box>
  );
};
