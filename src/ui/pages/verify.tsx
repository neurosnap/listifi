import { profileUrl } from '@app/routes';
import { selectUser } from '@app/token';
import { selectVerifyEmail } from '@app/verify';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const verify = useSelector(selectVerifyEmail);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (verify.success) {
      toast({
        status: 'success',
        duration: 3000,
        title: 'Your email has been verified',
        isClosable: true,
      });
      if (user.username) {
        navigate(profileUrl(user.username));
      }
    }
  }, []);

  if (verify.error) {
    return (
      <Box>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Email verification failed</AlertTitle>
          <AlertDescription>{verify.data.message}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (verify.success) {
    return (
      <Box>
        <Alert status="success">
          <AlertIcon />
          <AlertTitle mr={2}>Success!</AlertTitle>
          <AlertDescription>Your email has been verified.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Alert status="info">
        <AlertIcon />
        <AlertTitle mr={2}>Oops!</AlertTitle>
        <AlertDescription>{verify.data.message}</AlertDescription>
      </Alert>
    </Box>
  );
};

export default VerifyEmailPage;
