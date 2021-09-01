import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@chakra-ui/react';
import { selectDataById } from 'saga-query';

import { State } from '@app/types';
import { scrape } from '@app/scrape';

export default () => {
  const dispatch = useDispatch();
  const action = scrape({ url: 'https://news.ycombinator.com' });
  const ref = useRef(null);
  const id = JSON.stringify(action);
  const data = useSelector((state: State) => selectDataById(state, { id }));
  useEffect(() => {
    dispatch(action);
  }, []);
  return (
    <Box>
      <Box>Header</Box>
      <iframe
        srcDoc={data?.html}
        width="100%"
        height="800px"
        ref={ref}
      ></iframe>
    </Box>
  );
};
