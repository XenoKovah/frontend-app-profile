import {
  all,
  call,
  put,
  takeEvery,
} from 'redux-saga/effects';
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

  try {
    yield put(fetchProfileBegin());

    // The profile is read-only for everyone (the owner sees exactly what the
    // public sees), so always request the shared view -- the fields any logged-in
    // user is allowed to see. Preferences are fetched only to compute the
    // certificate gate below; they are never rendered.
    const [account, courseCertificatesResult, preferences] = yield all([
      call(ProfileApiService.getAccount, username, { sharedView: true }),
      call(ProfileApiService.getCourseCertificates, username),
      call(ProfileApiService.getPreferences, username),
    ]);

    // The certificates API only exposes a user's certificates to others when
    // visibility.course_certificates is explicitly all_users
    // (IsOwnerOrPublicCertificates in edx-platform); mirror that check here so
    // the page shows the certificate list a visitor would get.
    const courseCertificates = preferences.visibilityCourseCertificates === 'all_users'
      ? courseCertificatesResult
      : [];

    // Visitors cannot read preferences, so render with an empty set.
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
