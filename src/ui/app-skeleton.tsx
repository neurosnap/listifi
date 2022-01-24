import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink as RLink, Link as LLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  VStack,
  HStack,
  Flex,
  Box,
  Button,
  Grid,
  GridItem,
  Link,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

import { selectUser, selectHasTokenExpired } from '@app/token';
import { logout } from '@app/auth';
import {
  homeUrl,
  profileUrl,
  exploreUrl,
  settingsUrl,
  loginUrl,
  registerUrl,
  profileListsUrl,
} from '@app/routes';

import { CreateListModal } from './create-list-modal';

export const APP_SKELETON_ID = 'app-skeleton';

export const AppSkeleton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const hasExpired = useSelector(selectHasTokenExpired);
  const [modalOpen, setModalOpen] = useState(false);
  const createList = () => {
    setModalOpen(true);
  };

  return (
    <Box>
      <Grid
        h="100vh"
        gap={0}
        templateRows="1fr"
        templateColumns="1fr 680px 1fr"
        overflowX="hidden"
        id={APP_SKELETON_ID}
        sx={{
          '@media screen and (max-width: 768px)': {
            gridTemplateColumns: '100%',
          },
        }}
      >
        <GridItem
          rowSpan={1}
          colSpan={1}
          sx={{
            '@media screen and (max-width: 768px)': {
              display: 'none',
            },
          }}
        >
          <Flex justifyContent="end" ml={4}>
            <Box
              id="app-sidebar-content"
              pos="fixed"
              top={0}
              h="100vh"
              w="180px"
              mr={4}
            >
              <Box my={3} fontWeight="bold" fontSize={25}>
                <Link as={LLink} to={homeUrl()}>
                  listifi
                </Link>
              </Box>
              <VStack
                my={6}
                spacing={6}
                align="baseline"
                fontWeight="bold"
                fontSize={20}
              >
                {hasExpired ? null : (
                  <Link as={RLink} end to={homeUrl()}>
                    Home
                  </Link>
                )}
                {hasExpired ? null : (
                  <Link as={RLink} to={exploreUrl()}>
                    Explore
                  </Link>
                )}
                {hasExpired ? null : (
                  <Link as={RLink} to={profileListsUrl(user.username)}>
                    My Lists
                  </Link>
                )}
                {hasExpired ? null : (
                  <Link as={RLink} to={profileUrl(user.username)}>
                    Profile
                  </Link>
                )}
                {!hasExpired && user.is_guest ? (
                  <Link as={RLink} to={registerUrl()}>
                    Create account
                  </Link>
                ) : null}
              </VStack>
              <Box mt={10}>
                <Button
                  size="md"
                  variant="rainbow"
                  w="90%"
                  onClick={createList}
                >
                  Create list
                </Button>
              </Box>
            </Box>
            {hasExpired ? null : (
              <Menu id="profile-menu-id" isLazy>
                <MenuButton
                  id="user-menu-btn"
                  pos="fixed"
                  bottom={0}
                  w="180px"
                  mb={6}
                  mr={4}
                  py={2}
                  px={3}
                  borderRadius="30px"
                  cursor="pointer"
                  _hover={{ backgroundColor: 'purple.100' }}
                >
                  <Flex alignItems="center" justifyContent="space-between">
                    <HStack alignItems="center" spacing={4}>
                      <Avatar name={user.username} src="" />
                      <Text className="username">
                        {user.username || 'unknown'}
                      </Text>
                    </HStack>
                    <ChevronDownIcon size="lg" />
                  </Flex>
                </MenuButton>
                <MenuList>
                  {!hasExpired && !user.is_guest ? (
                    <MenuItem onClick={() => navigate(settingsUrl())}>
                      Settings
                    </MenuItem>
                  ) : null}
                  <MenuItem
                    onClick={() => {
                      dispatch(logout());
                      navigate(loginUrl());
                    }}
                  >
                    Signout
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>
        </GridItem>
        <GridItem
          colSpan={1}
          borderLeft="1px"
          borderRight="1px"
          borderColor="gray.200"
        >
          <Outlet />
        </GridItem>
        <GridItem
          colSpan={1}
          sx={{
            '@media screen and (max-width: 768px)': {
              display: 'none',
            },
          }}
        />
      </Grid>
      {modalOpen ? (
        <CreateListModal onClose={() => setModalOpen(false)} />
      ) : null}
    </Box>
  );
};
