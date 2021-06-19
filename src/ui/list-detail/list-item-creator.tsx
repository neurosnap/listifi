import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  Input,
  Textarea,
} from '@chakra-ui/react';

import { State, UpsertListItem } from '@app/types';
import {
  createListItem,
  createListItemBulk,
  defaultListItem,
} from '@app/lists';
import { selectLoaderById } from '@app/loaders';

import { useLoaderSuccess } from '../hooks';
import { Typeahead, useTypeahead } from '../typeahead';

export const ListItemCreator = ({ listId }: { listId: string }) => {
  const dispatch = useDispatch();
  const [item, setItem] = useState<UpsertListItem>(defaultListItem({ listId }));
  const [isOpen, setOpen] = useState(false);
  const [isManyOpen, setManyOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${createItem}` }),
  );

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const focusMany = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const createItem = () => {
    if (!item.text) {
      return;
    }

    dispatch(createListItem(item));
  };

  const createItems = () => {
    if (!item.text) {
      return;
    }

    dispatch(createListItemBulk(item));
  };

  const update = (c: Partial<UpsertListItem> = {}) =>
    setItem({ ...item, ...c });

  const open = () => {
    setOpen(true);
    setTimeout(() => focusInput(), 0);
  };
  const openMany = () => {
    setManyOpen(true);
    setTimeout(() => focusMany(), 0);
  };

  const close = () => {
    setOpen(false);
    setManyOpen(false);
  };
  const typeahead = useTypeahead(item.text);
  const keydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        createItem();
        break;
      case 'Esc':
      case 'Escape':
        close();
        break;
      default:
        break;
    }
  };
  const keydownMany = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (event.key) {
      case 'Esc':
      case 'Escape':
        close();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setItem({ ...item, listId });
  }, [listId]);

  useLoaderSuccess(loader, () => {
    setItem(defaultListItem({ listId }));
    if (isOpen) focusInput();
    if (isManyOpen) {
      close();
    }
  });
  const refocusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  };
  const refocusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  };

  if (isOpen) {
    return (
      <Box mt={4}>
        <Box>
          <Input
            variant="flushed"
            id="item-text"
            name="text"
            value={item.text}
            ref={inputRef}
            onKeyDown={keydown}
            placeholder="Type your new list item"
            onChange={(e) => update({ text: e.currentTarget.value })}
          />
          <Typeahead
            typeahead={typeahead}
            onSelect={(text: string) => update({ text })}
            refocus={refocusInput}
          />
        </Box>

        <ButtonGroup mt={4} spacing={4}>
          <Button
            onClick={createItem}
            isLoading={loader.isLoading}
            variant="rainbow"
            disabled={item.text === ''}
          >
            Add item
          </Button>
          <Button variant="link" onClick={close}>
            cancel
          </Button>
        </ButtonGroup>
      </Box>
    );
  }

  if (isManyOpen) {
    return (
      <Box mt={4}>
        <Box>
          <FormControl id="list-items">
            <Textarea
              size="md"
              h="xs"
              placeholder="Write or paste your list here.  Each line is a list item."
              variant="flushed"
              resize="vertical"
              onKeyDown={keydownMany}
              ref={textareaRef}
              value={item.text}
              onChange={(e) => update({ text: e.currentTarget.value })}
            />
            <Typeahead
              typeahead={typeahead}
              onSelect={(text: string) => update({ text })}
              refocus={refocusTextarea}
            />
            <FormHelperText>
              Enter your list items. Each line is a list item. You&apos;ll be
              able to edit these later.
            </FormHelperText>
          </FormControl>
        </Box>

        <ButtonGroup mt={4} spacing={4}>
          <Button
            onClick={createItems}
            isLoading={loader.isLoading}
            variant="rainbow"
            disabled={item.text === ''}
          >
            Add items
          </Button>
          <Button variant="link" onClick={close}>
            cancel
          </Button>
        </ButtonGroup>
      </Box>
    );
  }

  return (
    <ButtonGroup spacing={4} mt={4}>
      <Button variant="rainbow" onClick={open}>
        Add item
      </Button>
      <Button onClick={openMany} variant="rainbow">
        Add many items
      </Button>
    </ButtonGroup>
  );
};
