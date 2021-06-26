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
import { useSelector } from 'react-redux';

import { listDetailUrl, profileUrl } from '@app/routes';
import { ActivityClient, State } from '@app/types';
import { selectListById, createSelectItemsByList } from '@app/lists';
import { formatDate, isoToDate } from '@app/date';
import { selectUserById } from '@app/users';
import { selectCommentById } from '@app/comments';

import { ListBadges } from './list-detail/list-badges';
import { ListText } from './list-detail/list-text';
import { Comment } from './list-detail/comment';

const ActivityList = ({
  listId,
  context = '',
}: {
  listId: string;
  context?: string;
}) => {
  const list = useSelector((s: State) => selectListById(s, { id: listId }));
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
      <Box mt={context ? 9 : 4} ml={4} w="50px">
        <Avatar name={list.username} src="" />
      </Box>
      <VStack spacing={2} px={[4, 6]} py={4} align="stretch" flex="1">
        <Text fontSize="sm" fontWeight="bold">
          {context}
        </Text>
        <HStack alignItems="center" spacing={2}>
          <Text fontSize="sm">
            <Link
              as={RLink}
              onClick={(e) => e.stopPropagation()}
              to={profileUrl(list.username)}
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
        <UnorderedList spacing={2} styleType="circle">
          {items.map((item) => {
            return (
              <ListItem key={item.id}>
                <ListText text={item.text} />
              </ListItem>
            );
          })}
        </UnorderedList>
        <ListBadges list={list} />
      </VStack>
    </Flex>
  );
};

const ActivityComment = ({ activity }: { activity: ActivityClient }) => {
  const user = useSelector((s: State) =>
    selectUserById(s, { id: activity.creatorId }),
  );
  const comment = useSelector((s: State) =>
    selectCommentById(s, { id: activity.metadata.comment_id }),
  );
  return (
    <Box>
      <ActivityList
        listId={activity.subjectId}
        context={`${user.username} commented`}
      />
      {comment.id ? (
        <Box ml="50px" px={[4, 6]} w="90%">
          <Comment comment={comment} />
        </Box>
      ) : null}
    </Box>
  );
};

const ActivityStar = ({ activity }: { activity: ActivityClient }) => {
  const user = useSelector((s: State) =>
    selectUserById(s, { id: activity.creatorId }),
  );
  return (
    <ActivityList
      listId={activity.subjectId}
      context={`${user.username} starred`}
    />
  );
};

export const ActivityCard = ({ activity }: { activity: ActivityClient }) => {
  switch (activity.activityType) {
    case 'list':
      return <ActivityList listId={activity.subjectId} />;
    case 'comment':
      return <ActivityComment activity={activity} />;
    case 'star':
      return <ActivityStar activity={activity} />;
    default:
      return <Box>Activity type {activity.activityType} not found!</Box>;
  }
};
