import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { selectPluginsAsList } from '@app/plugins';
import { selectHasTokenExpired } from '@app/token';
import { createList } from '@app/lists';
import { State } from '@app/types';
import { selectLoaderById } from '@app/loaders';
import { listDetailUrl } from '@app/routes';
import { NAME_CHAR_LIMIT, validListName } from '@app/validate';

import { IntroView } from '../intro';
import { useLoaderSuccess, useValidator } from '../hooks';

const CreateView = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${createList}` }),
  );
  const plugins = useSelector(selectPluginsAsList);
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nextPlugins, setNextPlugins] = useState<Set<string>>(new Set());
  const [explorable, setExplorable] = useState(true);
  const nameValidator = useValidator(validListName);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = nameValidator.validate(name);
    if (!result.isValid) {
      return;
    }

    dispatch(
      createList({
        name,
        description,
        public: explorable,
        plugins: [...nextPlugins],
      }),
    );
  };

  useLoaderSuccess(loader, () => {
    const newList = loader.meta.list;
    toast({
      title: 'List has been created!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate(listDetailUrl(newList.username, newList.urlName));
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <Container maxW="3xl" boxShadow={['none', 'lg']} p={[0, 8]}>
      <form onSubmit={onSubmit}>
        <VStack spacing={8} align="stretch" py={4}>
          <Heading size="lg">Create a new list</Heading>
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
              This is the name of the list. It must be unique to your other
              lists. List name cannot exceed {NAME_CHAR_LIMIT} characters.
            </FormHelperText>
            <FormErrorMessage>{nameValidator.reason}</FormErrorMessage>
          </FormControl>
          <FormControl id="description">
            <Textarea
              name="description"
              type="text"
              placeholder="Description"
              variant="flushed"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
            <FormHelperText>What is the purpose of this list?</FormHelperText>
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
    </Container>
  );
};

const CreateListPage = () => {
  const hasTokenExpired = useSelector(selectHasTokenExpired);

  const title = 'Create a new list -- listifi';
  const description = 'Create a new list and share it on the listifi platform.';
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <Box minH="md">{hasTokenExpired ? <IntroView /> : <CreateView />}</Box>
    </>
  );
};

export default CreateListPage;
