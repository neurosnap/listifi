import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RLink } from 'react-router-dom';

import { removeComment } from '@app/comments';
import { ListCommentClient, State } from '@app/types';
import { Box, Button, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { selectUserById } from '@app/users';
import { profileUrl } from '@app/routes';
import { selectUser } from '@app/token';

import { isoToDate, formatDate } from '../../date';
import { ListText } from './list-text';

export const Comment = ({ comment }: { comment: ListCommentClient }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: State) =>
    selectUserById(state, { id: comment.userId }),
  );
  const curUser = useSelector(selectUser);
  const remove = () => {
    dispatch(removeComment({ id: comment.id }));
  };
  const isOwner = curUser.id === user.id;

  return (
    <VStack
      key={comment.id}
      spacing={4}
      my={4}
      p={4}
      align="stretch"
      bg="gray.50"
    >
      <HStack spacing={4} justify="space-between">
        <Text fontSize="xs">
          <Link as={RLink} to={profileUrl(user.username)}>
            {user.username}
          </Link>
          <span> · </span>
          {formatDate(isoToDate(comment.createdAt))}
        </Text>
        {isOwner ? (
          <Button size="xs" variant="link" onClick={remove}>
            delete
          </Button>
        ) : null}
      </HStack>
      <Box flex={1}>
        <ListText text={comment.comment} />
      </Box>
    </VStack>
  );
};
