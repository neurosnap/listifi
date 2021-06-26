import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';

import { selectPluginsAsList } from '@app/plugins';
import { createList } from '@app/lists';
import { State } from '@app/types';
import { selectLoaderById } from '@app/loaders';
import { NAME_CHAR_LIMIT, validListName } from '@app/validate';

import { useValidator } from './hooks';
import { Typeahead, useTypeahead } from './typeahead';

export const CreateList = () => {
  const dispatch = useDispatch();
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${createList}` }),
  );
  const plugins = useSelector(selectPluginsAsList);
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [nextPlugins, setNextPlugins] = useState<Set<string>>(new Set());
  const [explorable, setExplorable] = useState(true);
  const [items, setItems] = useState('');
  const nameValidator = useValidator(validListName);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typeahead = useTypeahead(items);
  const refocusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = nameValidator.validate(name);
    if (!result.isValid) {
      return;
    }

    dispatch(
      createList({
        name,
        public: explorable,
        items,
        plugins: [...nextPlugins],
      }),
    );
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <form onSubmit={onSubmit}>
      <VStack spacing={8} align="stretch" py={4}>
        <FormControl id="name" isRequired isInvalid={!nameValidator.isValid}>
          <Input
            variant="flushed"
            size="xl"
            placeholder="List name"
            value={name}
            ref={ref}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <FormHelperText>
            This is the name of the list. It must be unique to your other lists.
            List name cannot exceed {NAME_CHAR_LIMIT} characters.
          </FormHelperText>
          <FormErrorMessage>{nameValidator.reason}</FormErrorMessage>
        </FormControl>
        <FormControl id="list-public">
          <Checkbox
            name="list-public"
            variant="flushed"
            isChecked={explorable}
            onChange={(e) => setExplorable(e.target.checked)}
          >
            Explorable
          </Checkbox>
          <FormHelperText>
            This setting determines if a list is discoverable through our
            explore section. Regardless if a list is set to exporable or not,
            the list will be accessible via URL.
          </FormHelperText>
        </FormControl>
        <FormControl id="list-items">
          <Textarea
            size="md"
            h="xs"
            placeholder="Write or paste your list here.  Each line is a list item."
            variant="flushed"
            resize="vertical"
            value={items}
            ref={textareaRef}
            onChange={(e) => setItems(e.currentTarget.value)}
          />
          <Typeahead
            typeahead={typeahead}
            onSelect={(text: string) => setItems(text)}
            refocus={refocusTextarea}
          />
          <FormHelperText>
            Enter your list items. Each line is a list item. You&apos;ll be able
            to edit these later.
          </FormHelperText>
        </FormControl>
        <FormControl id="list-plugins">
          <FormLabel>Plugins</FormLabel>
          {plugins.map((plugin) => (
            <Checkbox
              key={plugin.id}
              name={`plugin-${plugin.id}`}
              variant="flushed"
              isChecked={nextPlugins.has(plugin.id)}
              onChange={(e) => {
                const next = new Set([...nextPlugins]);
                if (e.target.checked) {
                  next.add(plugin.id);
                } else {
                  next.delete(plugin.id);
                }
                setNextPlugins(next);
              }}
            >
              {plugin.name} - {plugin.description}
            </Checkbox>
          ))}
          <FormHelperText>
            Enable plugins to supercharge your list
          </FormHelperText>
        </FormControl>
        <Button
          variant="rainbow"
          type="submit"
          size="lg"
          isFullWidth
          isLoading={loader.isLoading}
        >
          Create
        </Button>
      </VStack>
    </form>
  );
};
