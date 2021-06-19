import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';

import { login } from '@app/auth';
import { State } from '@app/types';
import { Loaders, selectLoaderById } from '@app/loaders';
import { profileUrl } from '@app/routes';
import { fetchData } from '@app/bootup';

import { ErrorBox } from './atoms';
import { useLoaderSuccess } from './hooks';

export const LoginLocal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.login }),
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  useLoaderSuccess(loader, () => {
    dispatch(fetchData());
    navigate(profileUrl(loader.meta.user.username));
  });

  return (
    <form onSubmit={onSubmit}>
      <FormControl id="email" isRequired mb={4}>
        <FormLabel>Email</FormLabel>
        <Input
          size="lg"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired mb={4}>
        <FormLabel>Password</FormLabel>
        <Input
          size="lg"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
      </FormControl>
      <Button
        my={4}
        size="lg"
        isFullWidth
        type="submit"
        variant="rainbow"
        isLoading={loader.isLoading}
      >
        Continue
      </Button>
      <ErrorBox isInvalid={loader.isError}>{loader.message}</ErrorBox>
    </form>
  );
};
