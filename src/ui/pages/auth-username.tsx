import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

import { validUsername } from '@app/validate';
import { updateSettings } from '@app/users';
import { State } from '@app/types';
import { selectLoaderById } from '@app/loaders';
import { useNavigate } from 'react-router';
import { profileUrl } from '@app/routes';
import { selectUser } from '@app/token';

import { useLoaderSuccess } from '../hooks';

const AuthUsernamePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [username, setUsername] = useState(user.username);
  const validateUsername = useMemo(() => validUsername(username), [username]);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(updateSettings({ username }));
  };
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${updateSettings}` }),
  );
  const navigate = useNavigate();

  useLoaderSuccess(loader, () => {
    navigate(profileUrl(username));
  });

  const title = 'Complete Sign Up';
  const description = 'Complete signup for joining listifi platform';
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

      <Container maxW="3xl" boxShadow={['none', 'lg']} p={[0, 8]}>
        <form onSubmit={submit}>
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
          <Button type="submit" variant="rainbow" mt={4}>
            Save
          </Button>
        </form>
      </Container>
    </>
  );
};

export default AuthUsernamePage;
