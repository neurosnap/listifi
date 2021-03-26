import React from 'react';
import { useSelector } from 'react-redux';

import { selectCommentsByListId } from '@app/comments';
import { State } from '@app/types';
import { Box, Spinner, VStack } from '@chakra-ui/react';
import { Loaders, selectLoaderById } from '@app/loaders';
import { selectListById } from '@app/lists';
import { PostComment } from './post-comment';
import { Comment } from './comment';

export const ListComments = ({ listId }: { listId: string }) => {
  const list = useSelector((state: State) =>
    selectListById(state, { id: listId }),
  );
  const comments = useSelector((state: State) =>
    selectCommentsByListId(state, { id: listId }),
  );
  const fetchLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.fetchComments }),
  );

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <PostComment listId={list.id} />
        {fetchLoader.loading && comments.length === 0 ? <Spinner /> : null}
        <Box>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </Box>
      </VStack>
    </Box>
  );
};
