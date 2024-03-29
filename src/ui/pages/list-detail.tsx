import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  Box,
  Heading,
  Text,
  Container,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

import {
  fetchList,
  selectListByUrl,
  updateList,
  markAsViewed,
} from '@app/lists';
import { ListClient, State } from '@app/types';
import { selectLoaderById, fetchListLoader } from '@app/loaders';
import { selectUser } from '@app/token';
import { listDetailUrl, homeUrl } from '@app/routes';

import { usePlugins } from '../use-plugins';
import { ListDetailItemsView } from '../list-detail/list-detail-items';
import { ListDetailRead } from '../list-detail/list-detail-read';
import { ListNameEdit } from '../list-detail/list-name-edit';
import { useLoaderSuccess, useUrlPrefix } from '../hooks';
import { BreadCrumbs } from '../breadcrumbs';

const ListDetailPage = () => {
  const dispatch = useDispatch();
  const { username, listname } = useParams();
  const list = useSelector((state: State) =>
    selectListByUrl(state, { username, listname }),
  );
  const [editing, setEditing] = useState(false);
  const user = useSelector(selectUser);
  const fetchLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: fetchListLoader(username, listname) }),
  );
  const updateLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${updateList}` }),
  );
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const canEdit = user.id === list.ownerId;
  const pluginData = usePlugins(list);
  const urlPrefix = useUrlPrefix();
  const nameRef = useRef<HTMLInputElement>(null);
  const edit = () => {
    if (!canEdit) {
      return;
    }

    setEditing(true);
    setTimeout(() => {
      if (nameRef.current) {
        nameRef.current.focus();
        nameRef.current.select();
      }
    }, 0);
  };

  useEffect(() => {
    dispatch(fetchList({ username, listname }));
    dispatch(markAsViewed({ listId: list.id }));
  }, [username, listname]);

  useLoaderSuccess(updateLoader, () => {
    toast({
      title: 'List has been updated!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    const newList: ListClient = updateLoader.meta.list;
    const nextUrl = listDetailUrl(newList.username, newList.urlName);
    if (location.pathname !== nextUrl) {
      navigate(nextUrl);
    }
    setEditing(false);
  });

  const notFound = fetchLoader.lastRun !== 0 && list.id === '';
  let content = <Spinner />;
  if (list.id !== '') {
    content = (
      <>
        <BreadCrumbs goBack={homeUrl()}>List</BreadCrumbs>
        <Box mb={4}>
          {editing ? (
            <ListNameEdit
              stopEditing={() => setEditing(false)}
              list={list}
              nameRef={nameRef}
            />
          ) : (
            <ListDetailRead list={list} edit={edit} />
          )}
        </Box>
        <ListDetailItemsView
          pluginData={pluginData}
          list={list}
          canEdit={canEdit}
        />
      </>
    );
  } else if (notFound) {
    content = (
      <>
        <Heading>List not found</Heading>
        <Text>The list could not be found</Text>
      </>
    );
  }

  const description = list.description ? list.description : 'listifi';
  const title = list.name;
  const ogImage = `${urlPrefix}/og/${username}/${listname}`;
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="twitter:image:src" content={ogImage} />
      </Helmet>
      <Container maxW="3xl" p={0}>
        {content}
      </Container>
    </>
  );
};

export default ListDetailPage;
