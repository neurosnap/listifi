import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Heading, Container, Box } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

import { selectHasTokenExpired } from '@app/token';
import { listDetailUrl } from '@app/routes';

import { IntroView } from '../intro';
import { CreateList } from '../create-list';
import { useCreateListToast } from '../hooks';

const CreateListPage = () => {
  const navigate = useNavigate();
  const hasTokenExpired = useSelector(selectHasTokenExpired);

  useCreateListToast((newList) =>
    navigate(listDetailUrl(newList.username, newList.urlName)),
  );
  const title = 'Create a new list -- listifi';
  const description = 'Create a new list and share it on the listifi platform.';
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
      <Box minH="md">
        {hasTokenExpired ? (
          <IntroView />
        ) : (
          <Container maxW="3xl" p={[4, 8]}>
            <Heading size="lg">Create a new list</Heading>
            <CreateList />
          </Container>
        )}
      </Box>
    </>
  );
};

export default CreateListPage;
