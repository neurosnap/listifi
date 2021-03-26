import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectCommentsByItemId, fetchComments } from '@app/comments';
import { State } from '@app/types';
import { Box, Spinner, VStack } from '@chakra-ui/react';
import { Loaders, selectLoaderById } from '@app/loaders';
import { selectItemById } from '@app/lists';

import { PostComment } from './post-comment';
import { Comment } from './comment';

export const ListItemComments = ({ itemId }: { itemId: string }) => {
  const dispatch = useDispatch();
  const item = useSelector((state: State) =>
    selectItemById(state, { id: itemId }),
  );
  const comments = useSelector((state: State) =>
    selectCommentsByItemId(state, { id: itemId }),
  );
  const fetchLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.fetchComments }),
  );

  useEffect(() => {
    dispatch(fetchComments({ itemId, listId: item.listId }));
  }, [itemId]);

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <PostComment itemId={item.id} listId={item.listId} />
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
