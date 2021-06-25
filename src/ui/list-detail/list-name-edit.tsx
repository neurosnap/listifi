import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';

import { updateList } from '@app/lists';
import { ListClient, State } from '@app/types';
import { selectLoaderById, resetLoaderById } from '@app/loaders';
import { selectUser } from '@app/token';
import { listDetailUrl } from '@app/routes';
import { formatUrlName, NAME_CHAR_LIMIT, validListName } from '@app/validate';

import { useValidator, useUrlPrefix } from '../hooks';

export const ListNameEdit = ({
  stopEditing,
  list,
  nameRef,
}: {
  stopEditing: () => any;
  list: ListClient;
  nameRef: React.RefObject<HTMLInputElement>;
}) => {
  const dispatch = useDispatch();
  const [nextList, setNextList] = useState(list);
  const update = (li: Partial<ListClient> = {}) => {
    setNextList({ ...nextList, ...li });
  };
  const user = useSelector(selectUser);
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${updateList}` }),
  );
  const urlPrefix = useUrlPrefix();

  const nameValidator = useValidator(validListName);
  const save = (e: any) => {
    e.preventDefault();
    const result = nameValidator.validate(nextList.name);
    if (!result.isValid) {
      return;
    }
    dispatch(updateList(nextList));
  };
  const cancel = () => {
    dispatch(resetLoaderById(`${updateList}`));
    setNextList(list);
    stopEditing();
  };
  const keydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        save(event);
        break;
      case 'Esc':
      case 'Escape':
        cancel();
        break;
      default:
        break;
    }
  };

  const url = listDetailUrl(user.username, formatUrlName(nextList.name));

  useEffect(() => {
    setNextList(list);
  }, [list]);

  return (
    <form onSubmit={save}>
      <FormControl
        id="name"
        isRequired
        isInvalid={loader.isError || !nameValidator.isValid}
        mb={4}
      >
        <Input
          ref={nameRef}
          name="name"
          type="text"
          size="xl"
          value={nextList.name}
          variant="flushed"
          placeholder="enter name of list"
          onChange={(e) => update({ name: e.currentTarget.value })}
          onKeyDown={keydown}
        />
        <FormHelperText>{`${urlPrefix}${url}`}</FormHelperText>
        <FormHelperText>
          This name must be unique to all your lists. If you change the name of
          the list then the url will be updated as well. The list name cannot
          exceed {NAME_CHAR_LIMIT} characters.
        </FormHelperText>
        <FormErrorMessage>
          {loader.isError ? loader.message : ''}
          {nameValidator.reason}
        </FormErrorMessage>
      </FormControl>
      <FormControl id="description" mb={4}>
        <FormLabel>Description</FormLabel>
        <Textarea
          name="description"
          type="text"
          placeholder="Description"
          variant="flushed"
          value={nextList.description}
          onChange={(e) => update({ description: e.currentTarget.value })}
        />
        <FormHelperText>What is the purpose of this list?</FormHelperText>
      </FormControl>
      <Flex align="center">
        <ButtonGroup flex={1} spacing="6">
          <Button type="submit" isLoading={loader.isLoading} variant="rainbow">
            Save
          </Button>
          <Button variant="link" onClick={cancel}>
            cancel
          </Button>
        </ButtonGroup>
      </Flex>
    </form>
  );
};
