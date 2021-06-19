import {
  Box,
  Button,
  ButtonGroup,
  Link,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RLink } from 'react-router-dom';

import { createComment } from '@app/comments';
import { Loaders, selectLoaderById } from '@app/loaders';
import { loginUrl } from '@app/routes';
import { selectHasTokenExpired } from '@app/token';
import { State } from '@app/types';

import { useLoaderSuccess } from '../hooks';

export const PostComment = ({
  itemId,
  listId,
}: {
  itemId?: string;
  listId: string;
}) => {
  const dispatch = useDispatch();
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const postLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.createComment }),
  );
  const [open, setOpen] = useState(false);

  const [text, setText] = useState('');
  const type = (t: string) => setText(t);
  const post = () => {
    dispatch(
      createComment({
        itemId,
        listId,
        comment: text,
      }),
    );
  };

  useLoaderSuccess(postLoader, () => {
    setText('');
    setOpen(false);
  });

  if (hasTokenExpired) {
    return (
      <Box>
        <Text fontSize="sm">
          <Link as={RLink} to={loginUrl()}>
            Login
          </Link>{' '}
          to leave a comment
        </Text>
      </Box>
    );
  }

  if (!open) {
    return (
      <Button variant="link" onClick={() => setOpen(true)}>
        Write a comment
      </Button>
    );
  }

  return (
    <VStack spacing={4} align="flex-end" px={[0, 4]}>
      <Textarea
        variant="flushed"
        name="comment"
        placeholder="Write something about this list"
        value={text}
        resize="vertical"
        onChange={(e) => type(e.currentTarget.value)}
      />
      <ButtonGroup spacing={4}>
        <Button
          variant="rainbow"
          onClick={post}
          isLoading={postLoader.isLoading}
          disabled={text.length === 0}
        >
          post
        </Button>
        <Button variant="link" onClick={() => setOpen(false)}>
          cancel
        </Button>
      </ButtonGroup>
    </VStack>
  );
};
