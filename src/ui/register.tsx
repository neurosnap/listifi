import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';

import { register } from '@app/auth';
import { State } from '@app/types';
import { Loaders, selectLoaderById } from '@app/loaders';
import { selectClientId } from '@app/client-id';
import { listCreateUrl } from '@app/routes';
import { fetchData } from '@app/bootup';
import { validEmail, validPassword, validUsername } from '@app/validate';
import { selectUser } from '@app/token';

import { ErrorBox } from './atoms';
import { useLoaderSuccess, useValidator } from './hooks';

export const Register = () => {
  const dispatch = useDispatch();
  const navigation = useNavigate();
  const toast = useToast();
  const clientId = useSelector(selectClientId);
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.register }),
  );
  const user = useSelector(selectUser);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const passValidator = useValidator(validPassword);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = passValidator.validate(password, confirmPassword);
    if (!result.isValid) {
      return;
    }

    dispatch(register({ username, email, password, clientId }));
  };

  const validateUsername = useMemo(() => validUsername(username), [username]);
  const validateEmail = useMemo(() => validEmail(email), [email]);

  useLoaderSuccess(loader, () => {
    navigation(listCreateUrl());
    toast({
      title: 'Email verification has been sent',
      status: 'success',
      isClosable: true,
      duration: 3000,
    });
    dispatch(fetchData());
  });

  return (
    <form onSubmit={onSubmit}>
      <FormControl
        id="username"
        isRequired
        isInvalid={username !== '' && !validateUsername.isValid}
        mb={4}
      >
        <FormLabel>Username</FormLabel>
        <Input
          type="input"
          size="lg"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />
        <FormErrorMessage>{validateUsername.reason}</FormErrorMessage>
        <FormHelperText>
          Lists are scoped to username, e.g. myname/my-first-list
        </FormHelperText>
      </FormControl>
      <FormControl
        id="email"
        isRequired
        isInvalid={email !== '' && !validateEmail.isValid}
        mb={4}
      >
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          name="email"
          size="lg"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <FormErrorMessage>{validateEmail.reason}</FormErrorMessage>
      </FormControl>
      <FormControl id="password" isRequired mb={4}>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          name="password"
          size="lg"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
      </FormControl>
      <FormControl
        id="confirm-password"
        isRequired
        mb={4}
        isInvalid={!passValidator.isValid}
      >
        <FormLabel>Confirm Password</FormLabel>
        <Input
          type="password"
          name="confirm-password"
          size="lg"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        />
        <FormErrorMessage>{passValidator.reason}</FormErrorMessage>
      </FormControl>
      <Button
        my={4}
        variant="rainbow"
        size="lg"
        isFullWidth
        type="submit"
        isLoading={loader.loading}
      >
        Create account
      </Button>
      <ErrorBox isInvalid={loader.error}>{loader.message}</ErrorBox>
    </form>
  );
};
