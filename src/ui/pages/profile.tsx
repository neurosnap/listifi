import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RLink } from 'react-router-dom';
import { useLocation, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { fetchUser, selectUserById } from '@app/users';
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Tag,
  Text,
} from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import { State } from '@app/types';
import {
  fetchStars,
  selectListsByUserId,
  selectStarredLists,
  sortListByUpdated,
} from '@app/lists';
import { formatDate, isoToDate } from '@app/date';
import { Loaders, selectLoaderById } from '@app/loaders';
import { listCreateUrl, settingsUrl } from '@app/routes';
import { selectUser } from '@app/token';

import { ListItemView, ListsView } from '../lists-view';
import { RainbowRuler } from '../atoms';

const ProfilePage = () => {
  const { username } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: State) =>
    selectUserById(state, { id: username }),
  );
  const curUser = useSelector(selectUser);
  const lists = useSelector((state: State) =>
    selectListsByUserId(state, { id: user.id }),
  );
  const sortedLists = useMemo(() => lists.sort(sortListByUpdated), [lists]);
  const starredLists = useSelector((state: State) =>
    selectStarredLists(state, { username }),
  );
  const sortedStarredLists = useMemo(
    () => starredLists.sort(sortListByUpdated),
    [starredLists],
  );
  const date = useMemo(() => formatDate(isoToDate(user.createdAt)), [
    user.createdAt,
  ]);
  const userLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.fetchUser }),
  );

  useEffect(() => {
    if (username) {
      dispatch(fetchUser(username));
      dispatch(fetchStars(username));
    }
  }, [username]);

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
      <Box>
        <Box mb={4}>
          <Flex align="center">
            <Heading size="lg">{user.username} </Heading>
            {user.id === curUser.id ? (
              <Link fontSize="sm" ml={8} as={RLink} to={settingsUrl()}>
                <SettingsIcon mr={1} />
                settings
              </Link>
            ) : null}
          </Flex>
          {user.isGuest ? <Tag>guest-account</Tag> : null}
        </Box>
        <Box mb={4}>
          <Text as="i">Member since {date}</Text>
        </Box>
        <RainbowRuler />
        <SimpleGrid columns={[1, 1, 2]} spacing={[8, 16]}>
          <Box>
            <Heading size="md" mb={4}>
              Your lists
            </Heading>
            <ListsView>
              {!userLoader.isLoading && sortedLists.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  <Text mr={2}>You have not created a list yet.</Text>
                  <Link display="inline-block" as={RLink} to={listCreateUrl()}>
                    Create a list now!
                  </Link>
                </Alert>
              ) : null}
              {sortedLists.map((list) => (
                <ListItemView key={list.id} list={list} showFrom={false} />
              ))}
            </ListsView>
          </Box>
          <Box>
            <Heading size="md" mb={4}>
              Starred lists
            </Heading>
            <ListsView>
              {sortedStarredLists.map((list) => (
                <ListItemView key={list.id} list={list} />
              ))}
            </ListsView>
          </Box>
        </SimpleGrid>
      </Box>
    </>
  );
};

export default ProfilePage;
