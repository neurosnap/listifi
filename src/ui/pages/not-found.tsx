import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Footer } from '../footer';
import { Nav } from '../nav';

const NotFound = () => {
  const title = '404 not found -- listifi';
  const description = 'The page you are requesting does not exist.';
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <Flex direction="column" position="relative">
        <Nav />
        <Box mx={[4, 4, 24]} my={[8, 16]}>
          <Flex p={[8, 16]} direction="column" align="center" justify="center">
            <Heading>404 -- Page not found</Heading>
            <Text>The page you are requesting does not exist.</Text>
          </Flex>
        </Box>
        <Footer />
      </Flex>
    </>
  );
};

export default NotFound;
