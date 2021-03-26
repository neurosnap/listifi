import { Box, Flex } from '@chakra-ui/react';
import React from 'react';

export const Hero = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex align="center" justify="center" h={['300px', '400px']} w="100%">
      <Box>{children}</Box>
    </Flex>
  );
};
