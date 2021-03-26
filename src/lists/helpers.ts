import { ListClient } from '@app/types';

export const sortListByNew = (a: ListClient, b: ListClient) => {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

export const sortListByUpdated = (a: ListClient, b: ListClient) => {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
};

export const sortListByPopular = (a: ListClient, b: ListClient) => {
  if (a.stars === b.stars) {
    sortListByUpdated(a, b);
  }

  return b.stars - a.stars;
};

export const sortListByComments = (a: ListClient, b: ListClient) => {
  return b.comments - a.comments;
};
