import React, { useMemo } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';

import { useSelector } from 'react-redux';
import { selectPublicListsByPopularity } from '@app/lists';
import { exploreUrl, listCreateUrl } from '@app/routes';

import { Hero } from '../hero';
import { RainbowRuler } from '../atoms';
import { Footer } from '../footer';
import { Nav } from '../nav';
import { ListsView } from '../lists-view';
import { ExploreItem } from '../explore-item';

const Welcome = () => {
  const navigate = useNavigate();
  const title = 'listifi -- sharable lists';
  const description =
    'Listifi is a platform to easily share, save, and explore our most popular lists.';
  const lists = useSelector(selectPublicListsByPopularity);
  const truncatedList = useMemo(() => lists.slice(0, 8), [lists]);

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
      <Flex direction="column" position="relative">
        <Nav />
        <Box>
          <Hero>
            <Container display="flex" flexDirection="column" maxW="2xl">
              <Heading size="2xl">Create lists to share with everyone</Heading>
              <RainbowRuler />
              <ButtonGroup>
                <Button
                  variant="rainbow"
                  boxShadow="md"
                  onClick={() => navigate(listCreateUrl())}
                >
                  Try it out
                </Button>
                <Button
                  onClick={() => navigate(exploreUrl())}
                  variant="outline"
                  bg="white"
                >
                  Explore
                </Button>
              </ButtonGroup>
            </Container>
          </Hero>
        </Box>
        <Container maxW="1000px" py={[8, 16]}>
          <SimpleGrid columns={[1, 1, 3]} rows={2} spacing={12}>
            <Box>
              <Heading>Create</Heading>
              <RainbowRuler />
              <Text>
                Creating a list on listifi is so simple you don&apos;t even need
                an account. We allow users to sign in as guests which makes it
                easy to get started. Register for an account at any time to
                claim the lists you created.
              </Text>
            </Box>
            <Box>
              <Heading>Share</Heading>
              <RainbowRuler />
              <Text>
                Lists are <i>always</i> URL addressable on listifi. This means
                that they are always public. While we support the option to hide
                the list from being searchable, ultimately this app is designed
                to make lists viral.
              </Text>
            </Box>
            <Box>
              <Heading>Explore</Heading>
              <RainbowRuler />
              <Text>
                Discover the most popular lists on our platform. Our goal is to
                make interesting lists discoverable through our app. Whether
                it&apos;s by searching for lists in our explore page or by
                stumbling upon a viral list being shared on social media,
                finding lists that are impactful to you is the purpose of this
                app.
              </Text>
            </Box>
            <Box>
              <Heading>Plugins</Heading>
              <RainbowRuler />
              <Text>
                Supercharge your lists with plugins. We have plugins that allow
                users to <strong>vote</strong> on list items or provide{' '}
                <strong>suggestions</strong> that the owner can accept or
                reject.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
        <Container maxW="1000px" py={[8, 16]}>
          <Heading size="md" mb={4}>
            Trending lists
          </Heading>
          <ListsView>
            {truncatedList.map((list) => (
              <ExploreItem key={list.id} list={list} />
            ))}
          </ListsView>
        </Container>
        <Footer />
      </Flex>
    </>
  );
};

export default Welcome;
