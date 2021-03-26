import { ListClient } from '@app/types';
import { ChatIcon, StarIcon } from '@chakra-ui/icons';
import { Box, Flex, HStack, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { usePluginInfo } from '../use-plugins';

export const ListBadges = ({ list }: { list: ListClient }) => {
  const plugins = usePluginInfo(list);
  return (
    <HStack spacing={2} align="center" justify="center">
      {plugins.map((plugin) => {
        return (
          <Tooltip key={plugin.name} label={plugin.description}>
            <Flex align="center">
              <plugin.Icon />
            </Flex>
          </Tooltip>
        );
      })}
      <Flex align="center">
        <ChatIcon />
        <Box ml={1}>{list.comments}</Box>
      </Flex>
      <Flex align="center">
        <StarIcon />
        <Box ml={1}>{list.stars}</Box>
      </Flex>
    </HStack>
  );
};
