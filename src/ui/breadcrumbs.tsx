import React from 'react';

import { useNavigate } from 'react-router-dom';
import { Flex, Box, Heading } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

import { Menu } from './menu';
import { APP_SKELETON_ID } from './app-skeleton';

export const BreadCrumbs = ({
  children,
  goBack = '',
}: {
  children: React.ReactNode;
  goBack?: string;
}) => {
  const navigate = useNavigate();
  const onClick = () => {
    const el = document.querySelector(`#${APP_SKELETON_ID}`);
    if (el) {
      el.scrollTo(0, 0);
    }
  };
  const back = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    navigate(goBack);
  };

  return (
    <Box
      onClick={onClick}
      position="sticky"
      top={0}
      left={0}
      width="100%"
      backgroundColor="white"
      zIndex={1}
      cursor="pointer"
    >
      <Flex
        justify="space-between"
        align="center"
        py={[1, 1, 4]}
        px={4}
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Heading size="md" flex={1}>
          <Flex align="center">
            {goBack !== '' ? (
              <Box onClick={back} p={2} mr={8}>
                <ArrowBackIcon />
              </Box>
            ) : null}
            {children}
          </Flex>
        </Heading>
        <Box py={2} px={2} id="mobile-nav">
          <Menu />
        </Box>
      </Flex>
    </Box>
  );
};
