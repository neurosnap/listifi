import React, { useState, useRef } from 'react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { useDispatch } from 'react-redux';
import { Input, Box, Divider, Flex, HStack, Button } from '@chakra-ui/react';

import { ListItemClient, PluginData } from '@app/types';
import { updateListItem } from '@app/lists';

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
  const dispatch = useDispatch();
  const { isDragging, ref, preview } = useDnD({
    move,
    index,
    itemId: item.id,
  });
  const opacity = isDragging ? 0 : 1;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const onEdit = () => {
    if (!canEdit) return;
    setEditing(true);
    setText(item.text);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, 0);
  };
  const onCancel = () => {
    setEditing(false);
  };
  const onUpdate = () => {
    dispatch(
      updateListItem({
        ...item,
        text,
      }),
    );
    onCancel();
  };

  const keydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        onUpdate();
        break;
      case 'Esc':
      case 'Escape':
        onCancel();
        break;
      default:
        break;
    }
  };

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
          {editing ? (
            <Flex w="100%" align="center">
              <Input
                variant="flushed"
                flex={1}
                value={text}
                ref={inputRef}
                onKeyDown={keydown}
                onChange={(e) => setText(e.currentTarget.value)}
              />
              <Button
                variant="rainbow"
                size="sm"
                w="72px"
                ml={2}
                onClick={onUpdate}
              >
                Update
              </Button>
              <Button
                variant="link"
                w="35px"
                ml={3}
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </Flex>
          ) : (
            <Box
              display="inline-block"
              w="100%"
              onClick={canEdit ? onEdit : () => {}}
              cursor={canEdit ? 'pointer' : 'auto'}
            >
              <ListText text={item.text} />
            </Box>
          )}
        </Box>
      </Flex>
      <Divider my={2} />
    </>
  );
};
