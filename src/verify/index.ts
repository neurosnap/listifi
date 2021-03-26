import { createAssign, createReducerMap } from 'robodux';

import { State, VerifyEmail } from '@app/types';

export const defaultVerifyEmail = (
  v: Partial<VerifyEmail> = {},
): VerifyEmail => {
  return {
    success: false,
    error: false,
    data: {},
    ...v,
  };
};
const init = defaultVerifyEmail();

export const VERIFY_EMAIL_SLICE = 'verifyEmail';
const slice = createAssign<VerifyEmail>({
  name: VERIFY_EMAIL_SLICE,
  initialState: init,
});
export const reducers = createReducerMap(slice);
export const selectVerifyEmail = (state: State) =>
  state[VERIFY_EMAIL_SLICE] || init;
