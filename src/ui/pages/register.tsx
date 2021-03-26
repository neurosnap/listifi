import {
  Box,
  Center,
  Container,
  Divider,
  Heading,
  Link,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link as RLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { loginUrl, privacyUrl, termsUrl } from '@app/routes';
import { selectEnv } from '@app/env';

import { Register } from '../register';
import { LoginGoogle } from '../login-google';

const RegisterPage = () => {
  const env = useSelector(selectEnv);
  const title = 'Sign up -- listifi';
  const description =
    'This page will help you register an account for the listifi platform.';
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
            Create your listifi account
          </Heading>
          <Register />
          <Divider my={4} />
          <Center>
            <LoginGoogle
              clientId={env.googleClientId}
              text="Sign up with Google"
            />
          </Center>
          <Divider my={4} />
          <Box mt={[4, 8]}>
            Already have an account?{' '}
            <Link as={RLink} to={loginUrl()}>
              Sign in
            </Link>
          </Box>
        </Box>

        <Box my={[4, 8]} fontSize="sm">
          <Box>
            <Text>
              By signing up, I agree to listifi&apos;s{' '}
              <Link as={RLink} to={termsUrl()}>
                Terms of Service
              </Link>
              .
            </Text>
          </Box>

          <Box mt={4}>
            <Text>
              To learn more about how listifi collect, uses and protect your
              personal data please read listifi&apos;s{' '}
              <Link as={RLink} to={privacyUrl()}>
                Privacy Policy
              </Link>
              .
            </Text>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default RegisterPage;
