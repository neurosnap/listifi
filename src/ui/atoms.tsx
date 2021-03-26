import React from 'react';
import { Box } from '@chakra-ui/react';

export const ErrorBox = ({
  isInvalid,
  children,
}: {
  isInvalid: boolean;
  children: React.ReactNode;
}) => {
  if (!isInvalid) {
    return null;
  }

  return (
    <Box
      bg="red.400"
      color="white"
      border="1px"
      borderColor="red.500"
      rounded="md"
      my={4}
      p={4}
    >
      {children}
    </Box>
  );
};

export const RainbowRuler = ({
  size = 'md',
  my = 4,
}: {
  size?: 'sm' | 'md' | 'lg';
  my?: number;
}) => {
  let h = 20;
  if (size === 'sm') {
    h = 5;
  } else if (size === 'lg') {
    h = 30;
  }

  return (
    <Box
      w="100%"
      h={`${h}px`}
      bg="white"
      my={my}
      opacity={0.7}
      backgroundImage="repeating-linear-gradient(to right,
    #c4e17f 0px, #c4e17f 50px,
    #f7fdca 50px, #f7fdca 100px,
    #fad071 100px, #fad071 150px,
    #f0766b 150px, #f0766b 200px,
    #db9dbe 200px, #db9dbe 250px,
    #c49cdf 250px, #c49cdf 300px,
    #6599e2 300px, #6599e2 350px,
    #61c2e4 350px, #61c2e4 400px);"
      backgroundSize={`100% ${h / 2}px`}
      backgroundRepeat="no-repeat"
    />
  );
};
