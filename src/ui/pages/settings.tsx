import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Tag,
  VStack,
} from '@chakra-ui/react';
import { Navigate } from 'react-router';

import { selectHasTokenExpired, selectUser } from '@app/token';
import { updateSettings } from '@app/users';
import { notFoundUrl } from '@app/routes';

import { RainbowRuler } from '../atoms';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const name = user.name ? `(${user.name})` : '';
  const description = `The settings page for ${user.username}`;
  const title = `${user.username} ${name}`;

  const [emailNotification, setEmailNotification] = useState(
    user.email_notifications,
  );
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(updateSettings({ email_notifications: emailNotification }));
  };

  if (hasTokenExpired || user.is_guest) {
    return <Navigate to={notFoundUrl()} />;
  }

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
      <Box>
        <Box mb={4}>
          <Heading size="lg">{user.username}</Heading>
          {user.is_guest ? <Tag>guest-account</Tag> : null}
        </Box>
        <RainbowRuler />
      </Box>
      <Container>
        <Box>Email: {user.email}</Box>
        <Box>Name: {user.name}</Box>
        <form onSubmit={submit}>
          <VStack spacing={8} align="stretch" py={4}>
            <FormControl id="email-notifications">
              <FormLabel>Notifications</FormLabel>
              <Checkbox
                name="email-notifications"
                variant="flushed"
                isChecked={emailNotification}
                onChange={(e) => setEmailNotification(e.target.checked)}
              >
                Email notifications
              </Checkbox>
              <FormHelperText>
                This setting determines whether or not we will send you email
                notifications based on user activity. For example, we will send
                users an email when someone posts a comment on their list.
              </FormHelperText>
            </FormControl>
            <Button type="submit" variant="rainbow">
              Save
            </Button>
          </VStack>
        </form>
      </Container>
    </>
  );
};

export default SettingsPage;
