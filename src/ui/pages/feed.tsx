import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectLoaderById } from 'saga-query';
import { Box, Spinner } from '@chakra-ui/react';

import { State } from '@app/types';
import { fetchFeed } from '@app/lists';
import { selectActivityByIds } from '@app/activities';

import { BreadCrumbs } from '../breadcrumbs';
import { ActivityCard } from '../activity-card';
import { useCreateListToast } from '../hooks';
import { NextButton } from '../next-btn';

export default () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${fetchFeed}` }),
  );
  const metaIds = loader.meta.ids || [];
  const [ids, setIds] = useState<string[]>(metaIds);
  const activityIds: string[] = [];
  for (let i = 1; i <= page; i += 1) {
    activityIds.push(`feed-${i}`);
  }
  const activities = useSelector((s: State) =>
    selectActivityByIds(s, { ids: activityIds }),
  );

  useEffect(() => {
    dispatch(fetchFeed({ page }));
  }, [page]);

  useCreateListToast(() => {
    dispatch(fetchFeed({ page: 1 }));
  });

  useEffect(() => {
    const nextIds = new Set([...ids, ...metaIds]);
    setIds([...nextIds]);
  }, [loader.meta.ids]);

  return (
    <Box position="relative">
      <BreadCrumbs>Feed</BreadCrumbs>
      <Box>
        {loader.isInitialLoading ? <Spinner /> : null}
        {activities.map((activity) => {
          return <ActivityCard key={activity.id} activity={activity} />;
        })}
      </Box>
      <NextButton
        isLoading={loader.isLoading}
        onClick={() => setPage(page + 1)}
      />
    </Box>
  );
};
