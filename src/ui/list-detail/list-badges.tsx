import React from 'react';
import { ViewIcon, ChatIcon, StarIcon, CopyIcon } from '@chakra-ui/icons';
import { Box, Flex, HStack, useClipboard, useToast } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';

import { starList, selectStarByListId } from '@app/lists';
import { State, ListClient } from '@app/types';
import { selectHasTokenExpired, selectIsUserGuest } from '@app/token';
import { listDetailUrl } from '@app/routes';
import { useUrlPrefix } from '../hooks';

export const ListBadges = ({ list }: { list: ListClient }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const urlPrefix = useUrlPrefix();
  const userHasStarred = useSelector((state: State) =>
    selectStarByListId(state, { id: list.id }),
  );
  const isGuest = useSelector(selectIsUserGuest);
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const canStar = !isGuest && !hasTokenExpired;
  const hover = { '.icon': { backgroundColor: 'purple.100' }, color: 'purple' };
  const star = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!canStar) return;
    dispatch(starList({ listId: list.id }));
  };
  const copyUrl = `${urlPrefix}${listDetailUrl(list.username, list.urlName)}`;
  const { onCopy } = useClipboard(copyUrl);
  const copy = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onCopy();
    toast({
      title: 'URL copied to clipboard!',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <HStack spacing={20}>
      <Flex align="center" _hover={hover} cursor="pointer">
        <Box borderRadius={30} padding="0 5px 5px 5px" className="icon">
          <ChatIcon />
        </Box>
        <Box ml={4}>{list.comments}</Box>
      </Flex>
      <Flex
        align="center"
        _hover={hover}
        sx={userHasStarred ? hover : {}}
        onClick={star}
        cursor="pointer"
      >
        <Box borderRadius={30} padding="0 5px 5px 5px" className="icon">
          <StarIcon />
        </Box>
        <Box ml={4}>{list.stars}</Box>
      </Flex>
      <Flex align="center" _hover={hover} onClick={copy}>
        <Box
          borderRadius={30}
          padding="0 5px 5px 5px"
          className="icon"
          cursor="pointer"
        >
          <CopyIcon />
        </Box>
      </Flex>
      <Flex align="center">
        <Box borderRadius={30} padding="0 5px 5px 5px" className="icon">
          <ViewIcon />
        </Box>
        <Box ml={4}>{list.views}</Box>
      </Flex>
    </HStack>
  );
};
