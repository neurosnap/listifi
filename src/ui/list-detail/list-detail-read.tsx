import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Link,
  Tag,
  HStack,
} from '@chakra-ui/react';

import { ListClient } from '@app/types';
import { selectUser } from '@app/token';
import { profileUrl } from '@app/routes';
import { ListText } from './list-text';
import { ListBadges } from './list-badges';

export const ListDetailRead = ({
  list,
  edit,
}: {
  list: ListClient;
  edit: () => any;
}) => {
  const user = useSelector(selectUser);
  const canEdit = user.id === list.ownerId;
  const textProps = canEdit
    ? {
        onClick: edit,
      }
    : {};

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" wrap="wrap">
        <Flex direction="column" flex="1" maxW="100%" mb={[4, 4, 0]}>
          <Text fontSize="sm">
            <Link as={RLink} to={profileUrl(list.username)}>
              {list.username}
            </Link>
          </Text>
          <Heading
            size="lg"
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
      <Flex justify="center">
        <ListBadges list={list} />
      </Flex>
    </Box>
  );
};
