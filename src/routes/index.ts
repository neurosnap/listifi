export const HOME_URL = '/';
export const homeUrl = () => HOME_URL;
export const USER_PREFIX = '/u';
export const LIST_DETAIL_URL = `${USER_PREFIX}/:username/:listname`;
export const listDetailUrl = (username: string, listName: string) =>
  `${USER_PREFIX}/${username}/${listName}`;
export const LIST_ITEM_DETAIL_URL = `${LIST_DETAIL_URL}/:itemId`;
export const listItemDetailUrl = (
  username: string,
  listName: string,
  itemId: string,
) => `${listDetailUrl(username, listName)}/${itemId}`;
export const LIST_CREATE_URL = '/create-list';
export const listCreateUrl = () => LIST_CREATE_URL;
export const LOGIN_URL = '/login';
export const loginUrl = () => LOGIN_URL;
export const REGISTER_URL = '/register';
export const registerUrl = () => REGISTER_URL;
export const EXPLORE_URL = '/explore';
export const exploreUrl = () => EXPLORE_URL;
export const EXPLORE_BY_URL = '/explore/:sort';
export const exploreByUrl = (sort: string) => `/explore/${sort}`;
export const PROFILE_URL = '/u/:username';
export const profileUrl = (username: string) => `/u/${username}`;
export const VERIFY_URL = '/verify/:id/:code';
export const verifyUrl = (id: string, code: string) => `/verify/${id}/${code}`;
export const TERMS_URL = '/terms';
export const termsUrl = () => TERMS_URL;
export const PRIVACY_URL = '/privacy';
export const privacyUrl = () => PRIVACY_URL;
export const SETTINGS_URL = '/settings';
export const settingsUrl = () => SETTINGS_URL;
export const NOT_FOUND_URL = '/not-found';
export const notFoundUrl = () => NOT_FOUND_URL;
export const AUTH_USERNAME_URL = '/auth-username';
export const authUsernameUrl = () => AUTH_USERNAME_URL;
export const ABOUT_URL = '/about';
export const aboutUrl = () => ABOUT_URL;
