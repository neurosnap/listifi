import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Heading, HStack, Link } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { NavLink, useParams } from 'react-router-dom';

import {
  fetchPublicLists,
  selectPublicListsByComments,
  selectPublicListsByNew,
  selectPublicListsByPopularity,
  selectPublicListsByUpdated,
} from '@app/lists';
import { exploreByUrl, exploreUrl } from '@app/routes';

import { ListsView } from '../lists-view';
import { ExploreItem } from '../explore-item';

const ExplorePage = () => {
  const { sort = 'popular' } = useParams();
  const dispatch = useDispatch();
  const popularLists = useSelector(selectPublicListsByPopularity);
  const newLists = useSelector(selectPublicListsByNew);
  const updatedLists = useSelector(selectPublicListsByUpdated);
  const commentedLists = useSelector(selectPublicListsByComments);
  const getLists = () => {
    switch (sort) {
      case 'new':
        return newLists;
      case 'updated':
        return updatedLists;
      case 'commented':
        return commentedLists;
      case 'popular':
      default:
        return popularLists;
    }
  };
  const lists = getLists();

  useEffect(() => {
    dispatch(fetchPublicLists());
  }, []);

  const title = `Explore ${sort} lists`;
  const description = `Discover ${sort} lists on the listifi platform.`;
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
      <Container maxW="3xl" px={[0, 4]}>
        <Heading size="md" mb={4}>
          Explore our most popular lists
        </Heading>
        <HStack spacing={4} rounded={2} my={4} py={4}>
          <Link as={NavLink} to={exploreUrl()} end>
            popular
          </Link>
          <Link as={NavLink} to={exploreByUrl('new')} end>
            new
          </Link>
          <Link as={NavLink} to={exploreByUrl('updated')} end>
            updated
          </Link>
          <Link as={NavLink} to={exploreByUrl('commented')} end>
            commented
          </Link>
        </HStack>
        <ListsView>
          {lists.map((list) => (
            <ExploreItem key={list.id} list={list} />
          ))}
        </ListsView>
      </Container>
    </>
  );
};

export default ExplorePage;
