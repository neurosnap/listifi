import React from 'react';
import { Box, Container, Divider, Heading, Link } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { Link as RLink } from 'react-router-dom';

import { registerUrl } from '@app/routes';

import { LoginLocal } from '../login-local';
import { AuthProviders } from '../auth-providers';

const LoginPage = () => {
  const title = 'Sign in -- listifi';
  const description = 'This page will log you in to listifi';
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
      <Container maxW="lg" px={0}>
        <Box px={[4, 16]} py={[4, 8]} borderWidth="1px" boxShadow="lg">
          <Heading size="md" my={[4, 8]}>
            Sign in to your account
          </Heading>
          <LoginLocal />
          <Divider my={4} />
          <AuthProviders />
          <Divider my={4} />
          <Box mt={[4, 8]}>
            Don&apos;t have an account?{' '}
            <Link as={RLink} to={registerUrl()}>
              Sign up
            </Link>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default LoginPage;
