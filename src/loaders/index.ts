export const deleteItemLoader = (id: string) => `delete-item:${id}`;
export const fetchListLoader = (username: string, listname: string) =>
  `fetch-list:${username}/${listname}`;
export const updateSuggestionLoader = (id: string) => `update-suggestion:${id}`;
export { selectLoaderById, resetLoaderById } from 'saga-query';
