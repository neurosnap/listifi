import React from 'react';
import { Center } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

import { selectEnv } from '@app/env';

import { LoginGoogle } from './login-google';

export const AuthProviders = () => {
  const env = useSelector(selectEnv);
  return (
    <Center>
      <LoginGoogle clientId={env.googleClientId} text="Sign in with Google" />
    </Center>
  );
};
