import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  Skeleton,
  AppSkeleton,
  LoginPage,
  ExplorePage,
  RegisterPage,
  ProfilePage,
  WelcomePage,
  CreateListPage,
  ListDetailPage,
  VerifyPage,
  TermsPage,
  PrivacyPage,
  NotFoundPage,
  SettingsPage,
  AuthUsernamePage,
  AboutPage,
  FeedPage,
  ScrapePage,
  useUrlPrefix,
} from '@app/ui';
import {
  EXPLORE_URL,
  HOME_URL,
  LIST_CREATE_URL,
  LIST_DETAIL_URL,
  LOGIN_URL,
  PRIVACY_URL,
  PROFILE_URL,
  PROFILE_LISTS_URL,
  REGISTER_URL,
  TERMS_URL,
  VERIFY_URL,
  SETTINGS_URL,
  NOT_FOUND_URL,
  AUTH_USERNAME_URL,
  ABOUT_URL,
  SCRAPE_URL,
} from '@app/routes';
import { selectHasTokenExpired } from '@app/token';

export const RouterApp = () => {
  const urlPrefix = useUrlPrefix();
  const hasExpired = useSelector(selectHasTokenExpired);

  return (
    <>
      <Helmet>
        <meta property="og:image" content={`${urlPrefix}/listifi_card.png`} />
      </Helmet>
      <Routes>
        {hasExpired ? (
          <Route path={HOME_URL}>
            <WelcomePage />
          </Route>
        ) : null}
        <Route path={HOME_URL} element={<AppSkeleton />}>
          <Route path={HOME_URL}>
            <FeedPage />
          </Route>
          <Route path={EXPLORE_URL}>
            <ExplorePage />
          </Route>
          <Route path={LIST_DETAIL_URL}>
            <ListDetailPage />
          </Route>
          <Route path={PROFILE_LISTS_URL}>
            <ProfilePage listsOnly />
          </Route>
          <Route path={PROFILE_URL}>
            <ProfilePage listsOnly={false} />
          </Route>
          <Route path={SETTINGS_URL}>
            <SettingsPage />
          </Route>
          <Route path={LIST_CREATE_URL}>
            <CreateListPage />
          </Route>
        </Route>
        <Route path={HOME_URL} element={<Skeleton />}>
          <Route path={REGISTER_URL}>
            <RegisterPage />
          </Route>
          <Route path={LOGIN_URL}>
            <LoginPage />
          </Route>
          <Route path={VERIFY_URL}>
            <VerifyPage />
          </Route>
          <Route path={TERMS_URL}>
            <TermsPage />
          </Route>
          <Route path={PRIVACY_URL}>
            <PrivacyPage />
          </Route>
          <Route path={AUTH_USERNAME_URL}>
            <AuthUsernamePage />
          </Route>
          <Route path={ABOUT_URL}>
            <AboutPage />
          </Route>
          <Route path={SCRAPE_URL}>
            <ScrapePage />
          </Route>
        </Route>
        <Route path={NOT_FOUND_URL} element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};
