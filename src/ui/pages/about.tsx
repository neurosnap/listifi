import {
  Box,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { Helmet } from 'react-helmet-async';

const AboutPage = () => {
  const title = 'About listifi';
  const description =
    'My name is Eric Bower and this page describes why I built listifi and a little info about me';
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
      <Container>
        <Flex align="center" justify="center" mb={8}>
          <Box mr={4}>
            <Heading size="lg" mb={4}>
              Hey all!
            </Heading>
            <Text>
              My name is <strong>Eric Bower</strong> and I built this app to
              make it easier to create and share lists with colleagues and
              friends.
            </Text>
          </Box>
          <Image
            borderRadius="full"
            boxSize="200px"
            src="/me.jpg"
            alt="Eric Bower"
          />
        </Flex>

        <VStack spacing={4} align="stretch">
          <Text>
            Most of the list apps out in the wild focus on productivity. My goal
            with this app is to make it easy to share lists that can make an
            impact to anyone.
          </Text>
          <Text>
            I&apos;m a professional software engineer who has been programming
            since I was 13 years old. I love building software as much as I love
            building something that people find useful. Most of my time is
            devoted to growing my ability to build products.
          </Text>
          <Text>
            Currently I work at{' '}
            <Link href="https://aptible.com" isExternal>
              Aptible
            </Link>{' '}
            as a <i>Principle Software Engineer</i>, helping companies improve
            their security compliance with our GRC product.
          </Text>
          <Text>
            I also care deeply about open-source code and have an active{' '}
            <Link href="https://github.com/neurosnap" isExternal>
              Github
            </Link>
            , check it out if you&apos;re interested. I also write{' '}
            <Link href="https://erock.io" isExternal>
              blog articles about software
            </Link>
            .
          </Text>
          <Text>
            I&apos;m happy to read feedback about listifi so please feel free to{' '}
            <Link href="mailto:eric@listifi.app" isExternal>
              email me
            </Link>
            .
          </Text>
        </VStack>
      </Container>
    </>
  );
};

export default AboutPage;
