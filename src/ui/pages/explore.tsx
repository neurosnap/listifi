import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectLoaderById } from 'saga-query';
import { Box, Spinner } from '@chakra-ui/react';

import { State } from '@app/types';
import { fetchExplore, selectListsByIds } from '@app/lists';

import { ListsView, ListItemView } from '../lists-view';
import { BreadCrumbs } from '../breadcrumbs';
import { useCreateListToast } from '../hooks';
import { NextButton } from '../next-btn';

export default () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${fetchExplore}` }),
  );
  const metaIds = loader.meta.ids || [];
  const [ids, setIds] = useState<string[]>(metaIds);
  const lists = useSelector((state: State) => selectListsByIds(state, { ids }));

  useEffect(() => {
    dispatch(fetchExplore({ page }));
  }, [page]);

  useCreateListToast(() => {
    dispatch(fetchExplore({ page: 1 }));
  });

  useEffect(() => {
    const nextIds = new Set([...ids, ...metaIds]);
    setIds([...nextIds]);
  }, [loader.meta.ids]);

  return (
    <Box position="relative">
      <BreadCrumbs>Explore</BreadCrumbs>
      {loader.isInitialLoading ? <Spinner /> : null}
      <ListsView>
        {lists.map((list) => (
          <ListItemView key={list.id} list={list} />
        ))}
      </ListsView>
      <NextButton
        isLoading={loader.isLoading}
        onClick={() => setPage(page + 1)}
      />
    </Box>
  );
};
