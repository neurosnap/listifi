import { Box, Flex } from '@chakra-ui/react';
import React from 'react';
import { Outlet } from 'react-router';
import { Footer } from './footer';
import { Nav } from './nav';

export const Skeleton = () => {
  return (
    <Flex direction="column" position="relative">
      <Nav />
      <Box mx={[4, 4, 24]} my={[8, 16]}>
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
};
