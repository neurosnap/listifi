import React from 'react';

import { selectHasTokenExpired } from '@app/token';
import {
  Button,
  ButtonGroup,
  Container,
  Heading,
  Text,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUrl } from '@app/routes';
import { loginGuest } from '@app/auth';
import { selectLoaderById } from '@app/loaders';
import { State } from '@app/types';

export const IntroView = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${login}` }),
  );
  const login = () => {
    navigate(loginUrl());
  };
  const loginAsGuest = () => {
    dispatch(loginGuest());
  };

  if (!hasTokenExpired) {
    return null;
  }

  return (
    <Container>
      <Heading mb={4}>Getting started</Heading>
      <Text>
        In order to create a list, you must sign in. Feel free to login as a
        guest to try out the app and if you want to claim your lists later, all
        you need to do is create an account.
      </Text>
      <ButtonGroup
        mt={8}
        spacing={4}
        justifyContent="center"
        alignItems="center"
      >
        <Button variant="rainbow" onClick={login}>
          Sign in
        </Button>
        <Button onClick={loginAsGuest} isLoading={loader.isLoading}>
          Sign in as Guest
        </Button>
      </ButtonGroup>
    </Container>
  );
};
