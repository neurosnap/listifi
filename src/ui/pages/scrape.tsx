import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@chakra-ui/react';
import { selectDataById } from 'saga-query';

import { State } from '@app/types';
import { scrape } from '@app/scrape';

export default () => {
  const dispatch = useDispatch();
  const data = useSelector((state: State) =>
    selectDataById(state, { id: `${scrape}` }),
  );
  console.log(data);
  useEffect(() => {
    dispatch(scrape({ url: 'https://news.ycombinator.com' }));
  }, []);
  return <Box>Scrape page</Box>;
};
