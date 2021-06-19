import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Tooltip,
  useClipboard,
  Link,
  useToast,
  Tag,
  HStack,
} from '@chakra-ui/react';
import { CopyIcon, StarIcon } from '@chakra-ui/icons';

import { starList, selectStarByListId } from '@app/lists';
import { ListClient, State } from '@app/types';
import {
  selectHasTokenExpired,
  selectIsUserGuest,
  selectUser,
} from '@app/token';
import { listDetailUrl, profileUrl } from '@app/routes';
import { getUrlPrefix } from '@app/url';
import { ListText } from './list-text';

const noop = () => {};
export const ListDetailRead = ({
  list,
  edit,
}: {
  list: ListClient;
  edit: () => any;
}) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const userHasStarred = useSelector((state: State) =>
    selectStarByListId(state, { id: list.id }),
  );
  const isGuest = useSelector(selectIsUserGuest);
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const canStar = !isGuest && !hasTokenExpired;
  const user = useSelector(selectUser);
  const canEdit = user.id === list.ownerId;
  const copyUrl = `${getUrlPrefix()}${listDetailUrl(
    list.username,
    list.urlName,
  )}`;
  const { onCopy } = useClipboard(copyUrl);
  const copy = () => {
    onCopy();
    toast({
      title: 'URL copied to clipboard!',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  const star = () => {
    dispatch(starList({ listId: list.id }));
  };
  const highlight = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };
  const textProps = canEdit
    ? {
        onClick: edit,
      }
    : {};

  return (
    <Box>
      <Flex justify="space-between" align="center" wrap="wrap">
        <Flex direction="column" flex="1" maxW="100%" mb={[4, 4, 0]}>
          <Heading
            size="md"
            display="flex"
            alignItems="center"
            lineHeight="1.5em"
          >
            <Text isTruncated {...textProps}>
              {list.name}
            </Text>
            {canEdit ? (
              <Button variant="rainbow" size="xs" ml={2} onClick={edit}>
                edit
              </Button>
            ) : null}
          </Heading>
          <Text fontSize="sm" as="i">
            by{' '}
            <Link as={RLink} to={profileUrl(list.username)}>
              {list.username}
            </Link>
          </Text>
        </Flex>

        <Flex justify="right" align="center">
          {canStar ? (
            <Tooltip label="Star this list to save it for later">
              <Flex align="center">
                <Button
                  size="sm"
                  variant="rainbow"
                  aria-label="star"
                  leftIcon={<StarIcon />}
                  onClick={star}
                  disabled={!canStar}
                >
                  {userHasStarred ? 'unstar' : 'star'}
                </Button>
                <Box ml={2} mr={4}>
                  {list.stars}
                </Box>
              </Flex>
            </Tooltip>
          ) : (
            <Tooltip label="Login or signup to star this list">
              <Flex align="center" cursor="pointer">
                <StarIcon />
                <Box ml={2} mr={4}>
                  {list.stars}
                </Box>
              </Flex>
            </Tooltip>
          )}

          <InputGroup>
            <Input
              value={copyUrl}
              onChange={noop}
              onFocus={highlight}
              maxW="250px"
            />
            <InputRightElement>
              <Tooltip label="Copy list url">
                <IconButton
                  variant="rainbow"
                  aria-label="Copy list url"
                  onClick={copy}
                  icon={<CopyIcon />}
                  size="sm"
                />
              </Tooltip>
            </InputRightElement>
          </InputGroup>
        </Flex>
      </Flex>
      <HStack mt={4} spacing={4}>
        <Tag>{list.public ? 'searchable' : 'not searchable'}</Tag>
      </HStack>
      {list.description ? (
        <Box mt={4} py={4}>
          <ListText text={list.description} />
        </Box>
      ) : null}
      {canEdit && !list.description ? (
        <Button variant="link" onClick={edit} pt={4} pb={3}>
          Add a description
        </Button>
      ) : null}
    </Box>
  );
};
