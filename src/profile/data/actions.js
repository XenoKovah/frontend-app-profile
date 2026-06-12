import { AsyncActionType } from '../utils';

export const FETCH_PROFILE = new AsyncActionType('PROFILE', 'FETCH_PROFILE');

// FETCH PROFILE ACTIONS

export const fetchProfile = (username) => ({
  type: FETCH_PROFILE.BASE,
  payload: { username },
});

export const fetchProfileBegin = () => ({
  type: FETCH_PROFILE.BEGIN,
});

export const fetchProfileSuccess = (
  account,
  preferences,
  courseCertificates,
  isAuthenticatedUserProfile,
) => ({
  type: FETCH_PROFILE.SUCCESS,
  account,
  preferences,
  courseCertificates,
  isAuthenticatedUserProfile,
});

export const fetchProfileReset = () => ({
  type: FETCH_PROFILE.RESET,
});

// Surfaces a failed profile fetch (e.g. a 404) as an error so the page can
// redirect to /notfound.
export const fetchProfileFailure = errors => ({
  type: FETCH_PROFILE.FAILURE,
  payload: { errors },
});
