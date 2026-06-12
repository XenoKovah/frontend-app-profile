import {
  all,
  call,
  put,
  takeEvery,
} from 'redux-saga/effects';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  fetchProfileBegin,
  fetchProfileFailure,
  fetchProfileReset,
  fetchProfileSuccess,
  FETCH_PROFILE,
} from './actions';
import * as ProfileApiService from './services';

export function* handleFetchProfile(action) {
  const { username } = action.payload;
  const isOwnProfile = username === getAuthenticatedUser().username;

  try {
    yield put(fetchProfileBegin());

    // The profile is read-only for everyone (the owner sees exactly what the public
    // sees), so always request the shared view -- the fields any logged-in user may
    // see. Only the owner can read their own preferences (the preferences API is
    // IsUserInUrlOrStaff), and they're needed solely to gate certificates: that API
    // returns the OWNER their own certs regardless of visibility, so for the owner we
    // hide them unless explicitly shared. Every other viewer already gets only the
    // publicly-shared certs from the certs API, so we trust it as-is and skip
    // preferences -- fetching them would 403 for a non-owner and break the page.
    const calls = [
      call(ProfileApiService.getAccount, username, { sharedView: true }),
      call(ProfileApiService.getCourseCertificates, username),
    ];
    if (isOwnProfile) {
      calls.push(call(ProfileApiService.getPreferences, username));
    }
    const [account, courseCertificatesResult, preferences = {}] = yield all(calls);

    const courseCertificates = isOwnProfile && preferences.visibilityCourseCertificates !== 'all_users'
      ? []
      : courseCertificatesResult;

    // Preferences are never rendered -- only used for the certificate gate above.
    yield put(fetchProfileSuccess(
      account,
      {},
      courseCertificates,
      false,
    ));

    yield put(fetchProfileReset());
  } catch (e) {
    if (e.response.status === 404) {
      if (e.processedData && e.processedData.fieldErrors) {
        yield put(fetchProfileFailure(e.processedData.fieldErrors));
      } else {
        yield put(fetchProfileFailure(e.customAttributes));
      }
    } else {
      throw e;
    }
  }
}

export default function* profileSaga() {
  yield takeEvery(FETCH_PROFILE.BASE, handleFetchProfile);
}
