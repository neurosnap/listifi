import React, { useMemo } from 'react';
import { Box, Flex, GridItem, Link, Text, VStack } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';

import { ListClient } from '@app/types';
import { formatDate, isoToDate } from '@app/date';
import { listDetailUrl, profileUrl } from '@app/routes';

import { RainbowRuler } from './atoms';
import { ListBadges } from './list-detail/list-badges';

export const ExploreItem = ({ list }: { list: ListClient }) => {
  const updatedAt = useMemo(() => formatDate(isoToDate(list.updatedAt)), [
    list.updatedAt,
  ]);
  return (
    <GridItem colSpan={1}>
      <RainbowRuler size="sm" my={0} />
      <Box p={4} bg="gray.50" roundedBottom={4}>
        <Flex justify="space-between" align="center">
          <VStack align="stretch" spacing={1}>
            <Box>
              <Link
                fontSize="lg"
                as={RLink}
                to={listDetailUrl(list.username, list.urlName)}
              >
                {list.name}
              </Link>
            </Box>
            <Box>
              <Text fontSize="sm" mt={2} as="i" isTruncated>
                by{' '}
                <Link as={RLink} to={profileUrl(list.username)}>
                  {list.username}
                </Link>
              </Text>
            </Box>
          </VStack>
          <ListBadges list={list} />
        </Flex>
        <Box>
          <Text noOfLines={2} isTruncated maxW={['315px', '480px']} mt={2}>
            {list.description}
          </Text>
        </Box>
        <Text fontSize="xs">last updated {updatedAt}</Text>
      </Box>
    </GridItem>
  );
};
