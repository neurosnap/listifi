import { call, createEffects, put, select, spawn } from 'redux-cofx';

import { fetchStars, onFetchLists } from '@app/lists';
import { onFetchPlugins } from '@app/plugins';
import { createId, selectClientId, setClientId } from '@app/client-id';
import {
  resetToken,
  selectHasTokenExpired,
  selectToken,
  selectUser,
} from '@app/token';

export function* onFetchData() {
  const clientId = yield select(selectClientId);

  if (!clientId) {
    yield put(setClientId(createId()));
  }

  yield spawn(onFetchPlugins);

  const token = yield select(selectToken);
  if (token) {
    const hasTokenExpired: boolean = yield select(selectHasTokenExpired);
    if (hasTokenExpired) {
      yield put(resetToken());
      return;
    }

    yield call(onFetchLists);
    const user = yield select(selectUser);
    yield put(fetchStars(user.username));
  }
}

export function* onBootup() {
  yield call(onFetchData);
}

export const { bootup, fetchData } = createEffects({
  bootup: onBootup,
  fetchData: onFetchData,
});
