import {
  exploreUrl,
  homeUrl,
  listCreateUrl,
  loginUrl,
  profileUrl,
  registerUrl,
} from '@app/routes';
import { selectHasTokenExpired, selectUser } from '@app/token';
import { ArrowForwardIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, Link } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, Link as RLink } from 'react-router-dom';
import { Logout } from './logout';
import { Menu } from './menu';

const SignInLink = () => {
  const [hover, setHover] = useState(false);
  return (
    <Link
      as={NavLink}
      variant="basic"
      to={loginUrl()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      display="flex"
      alignItems="center"
    >
      <Box mr={1}>Sign in</Box>
      {hover ? <ArrowForwardIcon /> : <ChevronRightIcon />}
    </Link>
  );
};

export const Nav = () => {
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const user = useSelector(selectUser);

  const mobile = (
    <Flex
      justify="space-between"
      py={4}
      px={[4, 4, 24]}
      h="64px"
      id="mobile-nav"
    >
      <Flex align="center">
        <Heading>
          <Link variant="basic" as={RLink} to={homeUrl()}>
            listifi
          </Link>
        </Heading>
      </Flex>
      <Flex align="center">
        <Menu />
      </Flex>
    </Flex>
  );

  const desktop = (
    <Flex justify="space-between" py={4} px={[4, 4, 24]} h="64px" id="nav">
      <Flex align="center">
        <Heading mr={4}>
          <Link variant="basic" as={RLink} to={homeUrl()}>
            listifi
          </Link>
        </Heading>
        <Link variant="basic" mr={4} as={NavLink} to={exploreUrl()}>
          Explore
        </Link>
      </Flex>
      <Flex align="center">
        <Link variant="basic" mr={4} as={NavLink} to={listCreateUrl()}>
          + Create List
        </Link>
        {hasTokenExpired ? <SignInLink /> : null}
        {!hasTokenExpired ? (
          <Link
            variant="basic"
            to={profileUrl(user.username)}
            mr={4}
            as={RLink}
          >
            Profile
          </Link>
        ) : null}
        {!hasTokenExpired && user.is_guest ? (
          <Link variant="basic" to={registerUrl()} mr={4} as={RLink}>
            Create account
          </Link>
        ) : null}
        {!hasTokenExpired ? <Logout /> : null}
      </Flex>
    </Flex>
  );

  return (
    <Box>
      {mobile}
      {desktop}
    </Box>
  );
};
