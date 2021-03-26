import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import {
  deleteListItem,
  selectItemById,
  selectListById,
  updateListItem,
} from '@app/lists';
import { deleteItemLoader, Loaders, selectLoaderById } from '@app/loaders';
import { ListItemClient, PluginData, State } from '@app/types';
import { listDetailUrl } from '@app/routes';

import { useLoaderSuccess } from '../hooks';
import { Typeahead, useTypeahead } from '../typeahead';
import { RainbowRuler } from '../atoms';
import { PocketMenuPlugins } from '../pocket-menu-plugins';
import { ListText } from './list-text';
import { ListItemComments } from './list-item-comments';

function ListItemNameViewer({
  item,
  canEdit,
  closeModal,
}: {
  item: ListItemClient;
  canEdit: boolean;
  closeModal: () => any;
}) {
  const dispatch = useDispatch();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const updateLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.updateListItem }),
  );
  const deleteLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: deleteItemLoader(item.id) }),
  );
  const remove = (rmItemId: string) => {
    dispatch(deleteListItem({ listId: item.listId, itemId: rmItemId }));
  };
  const [nextItem, setNextItem] = useState(item);
  const cancel = () => {
    setNextItem({ ...item });
    onClose();
  };
  const update = (li: Partial<ListItemClient> = {}) => {
    setNextItem({ ...nextItem, ...li });
  };
  const save = () => {
    dispatch(updateListItem(nextItem));
  };
  const textarea = useRef<HTMLInputElement>(null);
  const keydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        save();
        break;
      default:
        break;
    }
  };
  const typeahead = useTypeahead(nextItem.text);
  const refocusInput = () => {
    if (textarea.current) {
      textarea.current.focus();
      const len = textarea.current.value.length;
      textarea.current.setSelectionRange(len, len);
    }
  };
  const focus = () => {
    if (textarea.current) {
      textarea.current.focus();
    }
  };
  const open = () => {
    onOpen();
    setTimeout(() => {
      focus();
    }, 0);
  };

  useLoaderSuccess(updateLoader, () => {
    onClose();
  });

  useLoaderSuccess(deleteLoader, () => {
    closeModal();
  });

  const textOwnerProps = canEdit
    ? {
        cursor: 'pointer',
        onClick: open,
      }
    : {};

  return isOpen ? (
    <VStack spacing={4} align="stretch" w="100%">
      <Box>
        <Input
          id="item-text"
          name="text"
          value={nextItem.text}
          variant="flushed"
          ref={textarea}
          onKeyDown={keydown}
          onChange={(e) => update({ text: e.currentTarget.value })}
        />
        <Typeahead
          typeahead={typeahead}
          onSelect={(text: string) => update({ text })}
          refocus={refocusInput}
        />
      </Box>
      <Box>
        <Textarea
          name="notes"
          placeholder="Add notes about the list item here"
          value={nextItem.notes}
          onChange={(e) => update({ notes: e.currentTarget.value })}
        />
      </Box>
      <Flex align="center">
        <ButtonGroup display="flex" flex={1} spacing="6" align="center">
          <Button
            variant="rainbow"
            onClick={save}
            size="sm"
            isLoading={updateLoader.loading}
          >
            Update item
          </Button>
          <Button variant="link" size="sm" onClick={cancel}>
            cancel
          </Button>
        </ButtonGroup>
        <Button
          size="sm"
          width="100px"
          variant="outline"
          colorScheme="pink"
          onClick={() => remove(item.id)}
          isLoading={deleteLoader.loading}
        >
          remove
        </Button>
      </Flex>
    </VStack>
  ) : (
    <VStack align="stretch" spacing={4}>
      <Flex {...textOwnerProps} align="center" w="100%">
        <ListText text={item.text} />
        {canEdit ? (
          <Button ml={4} size="sm" variant="rainbow" onClick={open}>
            edit
          </Button>
        ) : null}
      </Flex>
      <ListText text={item.notes} />
    </VStack>
  );
}

export function ListItemDetailModal({
  canEdit,
  pluginData,
  itemId,
}: {
  canEdit: boolean;
  pluginData: PluginData;
  itemId: string;
}) {
  const item = useSelector((state: State) =>
    selectItemById(state, { id: itemId }),
  );
  const list = useSelector((state: State) =>
    selectListById(state, { id: item.listId }),
  );
  const navigate = useNavigate();
  const onClose = () => {
    navigate(listDetailUrl(list.username, list.urlName));
  };

  return (
    <Modal
      size="2xl"
      isOpen
      onClose={onClose}
      motionPreset="none"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent borderRadius={0}>
        <ModalHeader>{list.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={[1, 6]}>
          <VStack spacing={4} flex={1} align="stretch">
            <Flex>
              <Box mr={4}>
                <PocketMenuPlugins pluginData={pluginData} item={item} />
              </Box>
              <ListItemNameViewer
                canEdit={canEdit}
                item={item}
                closeModal={onClose}
              />
            </Flex>

            <RainbowRuler size="sm" />
            <Box h={['md', 'xl']}>
              <ListItemComments itemId={item.id} />
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="rainbow" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
