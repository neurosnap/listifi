import React, { useMemo } from 'react';
import { Link as RLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Flex,
  Box,
  Link,
  Text,
  VStack,
  HStack,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { StarIcon, ViewIcon } from '@chakra-ui/icons';
import { useSelector } from 'react-redux';

import { listDetailUrl, profileUrl } from '@app/routes';
import { ListClient, State } from '@app/types';
import { createSelectItemsByList } from '@app/lists';
import { formatDate, isoToDate } from '@app/date';

import { ListBadges } from './list-detail/list-badges';
import { ListText } from './list-detail/list-text';

export const ListItemSimple = ({ list }: { list: ListClient }) => {
  const navigate = useNavigate();
  const updatedAt = formatDate(isoToDate(list.updatedAt));
  const onClick = () => {
    navigate(listDetailUrl(list.username, list.urlName));
  };

  return (
    <Flex
      onClick={onClick}
      borderBottom="1px"
      borderColor="gray.200"
      cursor="pointer"
      _hover={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
    >
      <Box mt={4} ml={4} w="50px">
        <Avatar name={list.username} src="" />
      </Box>
      <VStack spacing={2} px={[4, 6]} py={4} align="stretch" flex="1">
        <Flex align="center" justify="space-between">
          <HStack alignItems="center" spacing={2}>
            <Text fontSize="sm">
              <Link
                as={RLink}
                to={profileUrl(list.username)}
                onClick={(e) => e.stopPropagation()}
              >
                {list.username}
              </Link>
            </Text>
            <Text color="gray.600">·</Text>
            <Text color="gray.600" fontSize="sm">
              {updatedAt}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Flex align="center">
              <StarIcon />
              <Text ml={2}>{list.stars}</Text>
            </Flex>
            <Flex align="center">
              <ViewIcon />
              <Text ml={2}>{list.views}</Text>
            </Flex>
          </HStack>
        </Flex>
        <Box>
          <Text fontSize="xl" fontWeight="bold">
            {list.name}
          </Text>
        </Box>
        <Box>
          <Text as="i">{list.description}</Text>
        </Box>
      </VStack>
    </Flex>
  );
};

export const ListItemView = ({ list }: { list: ListClient }) => {
  const selectItemsByList = useMemo(() => createSelectItemsByList(), [list.id]);
  const items = useSelector((state: State) =>
    selectItemsByList(state, { id: list.id }),
  );
  const navigate = useNavigate();
  const updatedAt = formatDate(isoToDate(list.updatedAt));
  const onClick = () => {
    navigate(listDetailUrl(list.username, list.urlName));
  };
  return (
    <Flex
      onClick={onClick}
      borderBottom="1px"
      borderColor="gray.200"
      cursor="pointer"
      _hover={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
    >
      <Box mt={4} ml={4} w="50px">
        <Avatar name={list.username} src="" />
      </Box>
      <VStack spacing={2} px={[4, 6]} py={4} align="stretch" flex="1" w="85%">
        <HStack alignItems="center" spacing={2}>
          <Text fontSize="sm">
            <Link
              as={RLink}
              to={profileUrl(list.username)}
              onClick={(e) => e.stopPropagation()}
            >
              {list.username}
            </Link>
          </Text>
          <Text color="gray.600">·</Text>
          <Text color="gray.600" fontSize="sm">
            {updatedAt}
          </Text>
        </HStack>
        <Box>
          <Text fontSize="xl" fontWeight="bold">
            {list.name}
          </Text>
        </Box>
        <Box>
          <Text as="i">{list.description}</Text>
        </Box>
        <UnorderedList spacing={2} styleType="circle">
          {items.slice(0, 5).map((item) => {
            return (
              <ListItem key={item.id}>
                <ListText text={item.text} />
              </ListItem>
            );
          })}
        </UnorderedList>
        {items.length > 5 ? (
          <Link to={listDetailUrl(list.username, list.urlName)}>
            + {items.length - 5} more items
          </Link>
        ) : null}
        <Flex justify="center">
          <ListBadges list={list} />
        </Flex>
      </VStack>
    </Flex>
  );
};

export const ListsView = ({ children }: { children: React.ReactNode }) => {
  return <Box width="100%">{children}</Box>;
};
