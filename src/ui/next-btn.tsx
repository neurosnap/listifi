import React from 'react';
import { Box, Button } from '@chakra-ui/react';

export const NextButton = ({
  onClick,
  isLoading,
}: {
  onClick: () => any;
  isLoading: boolean;
}) => {
  return (
    <Box h="80px">
      <Button
        isDisabled={isLoading}
        isLoading={isLoading}
        onClick={onClick}
        h="100%"
        w="100%"
      >
        More
      </Button>
    </Box>
  );
};
