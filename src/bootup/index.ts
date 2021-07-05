import { takeEvery, call, put, select, spawn } from 'redux-saga/effects';
import { createAction } from 'robodux';

import { fetchStars, fetchLists } from '@app/lists';
import { fetchPlugins } from '@app/plugins';
import { createId, selectClientId, setClientId } from '@app/client-id';
import {
  resetToken,
  selectHasTokenExpired,
  selectToken,
  selectUser,
} from '@app/token';
import { ApiGen } from '@app/types';

export const fetchData = createAction('FETCH_DATA');
export function* onFetchData(): ApiGen {
  const clientId = yield select(selectClientId);

  if (!clientId) {
    yield put(setClientId(createId()));
  }

  yield spawn(fetchPlugins.run, fetchPlugins());

  const token = yield select(selectToken);
  if (token) {
    const hasTokenExpired: boolean = yield select(selectHasTokenExpired);
    if (hasTokenExpired) {
      yield put(resetToken());
      return;
    }

    yield call(fetchLists.run, fetchLists());
    const user = yield select(selectUser);
    yield put(fetchStars({ username: user.username }));
  }
}

export const bootup = createAction('BOOTUP');
export function* onBootup() {
  yield call(onFetchData);
}

function* watchBootup() {
  yield takeEvery(`${bootup}`, onBootup);
}

function* watchFetchData() {
  yield takeEvery(`${fetchData}`, onFetchData);
}

export const sagas = {
  watchBootup,
  watchFetchData,
};
