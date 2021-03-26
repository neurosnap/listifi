import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RLink, useNavigate } from 'react-router-dom';
import { ChatIcon, DragHandleIcon } from '@chakra-ui/icons';
import { Box, Divider, Flex, HStack, Link, Text } from '@chakra-ui/react';

import { selectListById } from '@app/lists';
import { ListItemClient, PluginData, State } from '@app/types';
import { listItemDetailUrl } from '@app/routes';
import { selectCommentsByItemId } from '@app/comments';

import { useDnD } from '../hooks';
import { PocketMenuPlugins } from '../pocket-menu-plugins';
import { ListText } from './list-text';

export const ListItemDisplay = ({
  item,
  move,
  index,
  canEdit,
  pluginData,
}: {
  item: ListItemClient;
  move(d: number, h: number): any;
  index: number;
  canEdit: boolean;
  pluginData: PluginData;
}) => {
  const navigate = useNavigate();
  const list = useSelector((state: State) =>
    selectListById(state, { id: item.listId }),
  );
  const open = () => {
    navigate(listItemDetailUrl(list.username, list.urlName, item.id));
  };
  const comments = useSelector((state: State) =>
    selectCommentsByItemId(state, { id: item.id }),
  );

  const { isDragging, ref, preview } = useDnD({
    move,
    index,
    itemId: item.id,
  });
  const opacity = isDragging ? 0 : 1;

  return (
    <>
      <Flex
        key={item.id}
        my={2}
        alignItems="center"
        justify="space-between"
        opacity={opacity}
        ref={preview}
      >
        <HStack space={2} mr={4}>
          {canEdit ? (
            <Box ref={ref}>
              <DragHandleIcon cursor="move" />
            </Box>
          ) : null}
          <PocketMenuPlugins item={item} pluginData={pluginData} />
        </HStack>
        <Box flex={1} py={2}>
          <Box display="inline-block" onClick={open} cursor="pointer" w="100%">
            <ListText text={item.text} />
          </Box>
        </Box>
        <Flex w="80px" justify="space-between" align="center">
          {comments.length > 0 ? (
            <Flex align="center">
              <Text mr={2}>{comments.length}</Text>
              <ChatIcon />
            </Flex>
          ) : (
            <Box />
          )}
          <Link
            to={listItemDetailUrl(list.username, list.urlName, item.id)}
            as={RLink}
          >
            view
          </Link>
        </Flex>
      </Flex>
      <Divider my={2} />
    </>
  );
};
