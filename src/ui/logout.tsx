import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import { Button } from '@chakra-ui/react';

import { logout } from '@app/auth';
import { loginUrl } from '@app/routes';

export const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onLogoutSuccess = () => {
    dispatch(logout());
    navigate(loginUrl());
  };
  return (
    <Button variant="link" onClick={onLogoutSuccess}>
      Sign out
    </Button>
  );
};
