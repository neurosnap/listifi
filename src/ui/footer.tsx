import React from 'react';
import {
  Box,
  Container,
  Heading,
  Link,
  ListItem,
  SimpleGrid,
  UnorderedList,
} from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';

import {
  aboutUrl,
  exploreUrl,
  homeUrl,
  listCreateUrl,
  loginUrl,
  privacyUrl,
  profileUrl,
  profileListsUrl,
  registerUrl,
  settingsUrl,
  termsUrl,
} from '@app/routes';
import { selectHasTokenExpired, selectUser } from '@app/token';
import { useSelector } from 'react-redux';
import { Logout } from './logout';

export const FooterAppLinks = () => {
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const user = useSelector(selectUser);
  return (
    <UnorderedList spacing={2} styleType="none" ml={0}>
      <ListItem>
        <Link as={RLink} to={homeUrl()}>
          Home
        </Link>
      </ListItem>
      <ListItem>
        <Link as={RLink} to={exploreUrl()}>
          Explore
        </Link>
      </ListItem>
      {hasTokenExpired ? null : (
        <ListItem>
          <Link as={RLink} to={profileListsUrl(user.username)}>
            My Lists
          </Link>
        </ListItem>
      )}
      {!hasTokenExpired && !user.is_guest ? (
        <ListItem>
          <Link as={RLink} to={profileUrl(user.username)}>
            Profile
          </Link>
        </ListItem>
      ) : null}
      <ListItem>
        <Link as={RLink} to={listCreateUrl()}>
          Create List
        </Link>
      </ListItem>
      {!hasTokenExpired && user.is_guest ? (
        <ListItem>
          <Link as={RLink} to={registerUrl()}>
            Create account
          </Link>
        </ListItem>
      ) : null}
      {hasTokenExpired ? (
        <ListItem>
          <Link as={RLink} to={loginUrl()}>
            Sign in
          </Link>
        </ListItem>
      ) : null}
      {!hasTokenExpired && !user.is_guest ? (
        <ListItem>
          <Link as={RLink} to={settingsUrl()}>
            Settings
          </Link>
        </ListItem>
      ) : null}
      {!hasTokenExpired ? (
        <ListItem>
          <Logout />
        </ListItem>
      ) : null}
    </UnorderedList>
  );
};

export const Footer = () => {
  return (
    <Container maxW="1000px" py={[8, 16]}>
      <SimpleGrid columns={[1, 1, 3]} spacing={12} minH="300px">
        <Box>
          <Heading size="md" mb={4}>
            App
          </Heading>
          <FooterAppLinks />
        </Box>
        <Box>
          <Heading size="md" mb={4}>
            Resources
          </Heading>
          <UnorderedList spacing={2} styleType="none" ml={0}>
            <ListItem>
              <Link as={RLink} to={termsUrl()}>
                Terms of Service
              </Link>
            </ListItem>
            <ListItem>
              <Link as={RLink} to={privacyUrl()}>
                Privacy Policy
              </Link>
            </ListItem>
            <ListItem>
              <Link as={RLink} to={aboutUrl()}>
                About
              </Link>
            </ListItem>
          </UnorderedList>

          <Box maxW="sm" mt={4}>
            We&apos;d be happy to hear from you. Don&apos;t hesitate to send us
            your ideas —{' '}
            <Link href="mailto:info@listifi.app">info@listifi.app</Link>
          </Box>
        </Box>
        <Box>
          <Heading size="md" mb={4}>
            <Link as={RLink} to={homeUrl()}>
              listifi
            </Link>
          </Heading>
          <Box>
            © 2020{' '}
            <Link href="https://erock.io" isExternal>
              Eric Bower
            </Link>
          </Box>
        </Box>
      </SimpleGrid>
    </Container>
  );
};
