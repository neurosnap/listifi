import React, { useState } from 'react';
import GoogleLogin from 'react-google-login';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@chakra-ui/react';

import { loginGoogle } from '@app/auth';
import { selectClientId } from '@app/client-id';
import { useNavigate } from 'react-router';
import { authUsernameUrl, homeUrl } from '@app/routes';
import { fetchData } from '@app/bootup';
import { State } from '@app/types';
import { selectLoaderById } from '@app/loaders';
import { isUuid } from '@app/validate';

import { useLoaderSuccess } from './hooks';
import { ErrorBox } from './atoms';

export const LoginGoogle = ({
  clientId,
  text,
}: {
  clientId: string;
  text: string;
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${loginGoogle}` }),
  );
  const appClientId = useSelector(selectClientId);

  const onSuccess = (resp: any) => {
    const { tokenId } = resp;
    dispatch(loginGoogle({ token: tokenId, clientId: appClientId }));
  };
  const [error, setError] = useState('');
  const onFailure = (err: any) => {
    setError(err.message);
  };

  useLoaderSuccess(loader, () => {
    dispatch(fetchData());
    if (isUuid(loader.meta.user.username)) {
      navigate(authUsernameUrl());
    } else {
      navigate(homeUrl());
    }
  });

  return (
    <Box>
      <ErrorBox isInvalid={!!error}>
        <Box>{error}</Box>
      </ErrorBox>
      <ErrorBox isInvalid={loader.isError}>{loader.message}</ErrorBox>
      <GoogleLogin
        clientId={clientId}
        buttonText={text}
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy="single_host_origin"
        isSignedIn={false}
      />
    </Box>
  );
};
