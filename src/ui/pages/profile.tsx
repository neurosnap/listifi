import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Avatar, Box, Flex, Heading, Tag, Text } from '@chakra-ui/react';

import { fetchUser, selectUserByName } from '@app/users';
import { State } from '@app/types';
import { selectActivityByIds } from '@app/activities';
import { strToDate, formatDate } from '@app/date';
import { homeUrl } from '@app/routes';

import { RainbowRuler } from '../atoms';
import { ActivityCard } from '../activity-card';
import { BreadCrumbs } from '../breadcrumbs';
import { useCreateListToast } from '../hooks';

const ProfilePage = ({ listsOnly }: { listsOnly: boolean }) => {
  const { username } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: State) =>
    selectUserByName(state, { username }),
  );

  const activities = useSelector((s: State) =>
    selectActivityByIds(s, { ids: [username] }),
  );
  const filteredActivities = activities.filter(
    (act) => act.activityType !== 'comment',
  );
  const listActivities = activities.filter(
    (act) => act.activityType === 'list',
  );
  const visibleActivities = listsOnly ? listActivities : filteredActivities;
  const date = formatDate(strToDate(user.createdAt));

  useEffect(() => {
    if (username) {
      dispatch(fetchUser({ username }));
    }
  }, [username]);

  useCreateListToast(() => {
    dispatch(fetchUser({ username }));
  });

  const content = (
    <Box>
      <BreadCrumbs goBack={homeUrl()}>{username}</BreadCrumbs>
      <Box p={4}>
        <Flex align="center">
          <Avatar src="" size="lg" name={username} />
          <Heading size="lg" ml={4}>
            {user.username}
          </Heading>
        </Flex>
        <Flex>
          <Box w="80px" />
          <Box>
            {user.isGuest ? <Tag>guest-account</Tag> : null}
            <Box mb={4}>
              <Text as="i">Member since {date}</Text>
            </Box>
            <Box>{listActivities.length} lists</Box>
          </Box>
        </Flex>
      </Box>
      <RainbowRuler />
      <Box>
        {visibleActivities.map((activity) => {
          return <ActivityCard key={activity.id} activity={activity} />;
        })}
      </Box>
    </Box>
  );

  const name = user.name ? `(${user.name})` : '';
  const description = `The profile page for ${username} ${name} on the listifi platform.`;
  const title = `${username} ${name}`;
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://listifi.app${location.pathname}`}
        />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      {content}
    </>
  );
};

export default ProfilePage;
