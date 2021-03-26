import React, { useMemo } from 'react';
import { Link as RLink } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  HStack,
  Link,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';

import { listDetailUrl, profileUrl } from '@app/routes';
import { ListClient } from '@app/types';
import { formatDate, isoToDate } from '@app/date';

import { RainbowRuler } from './atoms';
import { ListBadges } from './list-detail/list-badges';

export const ListItemView = ({
  list,
  showFrom = true,
}: {
  list: ListClient;
  showFrom?: boolean;
}) => {
  const updatedAt = useMemo(() => formatDate(isoToDate(list.updatedAt)), [
    list.updatedAt,
  ]);
  return (
    <GridItem py={2} colSpan={1}>
      <RainbowRuler size="sm" my={0} />
      <VStack
        spacing={2}
        px={[2, 4]}
        py={4}
        bg="gray.50"
        roundedBottom={4}
        align="stretch"
      >
        <Box>
          <Link as={RLink} to={listDetailUrl(list.username, list.urlName)}>
            {list.name}
          </Link>
        </Box>
        {showFrom ? (
          <Box>
            <Text fontSize="sm" mt={2} as="i" isTruncated>
              by{' '}
              <Link as={RLink} to={profileUrl(list.username)}>
                {list.username}
              </Link>
            </Text>
          </Box>
        ) : null}
        <Box>
          <Text noOfLines={2} isTruncated maxW={['315px', '480px']} mt={2}>
            {list.description}
          </Text>
        </Box>
        <HStack align="center" mt={2} spacing={2}>
          <Box>
            <Tag size="sm">{list.public ? 'searchable' : 'not searchable'}</Tag>
          </Box>
          <ListBadges list={list} />
        </HStack>
        <Text fontSize="xs">last updated {updatedAt}</Text>
      </VStack>
    </GridItem>
  );
};

export const ListsView = ({ children }: { children: React.ReactNode }) => {
  return (
    <Grid gap={4} width="100%">
      {children}
    </Grid>
  );
};
