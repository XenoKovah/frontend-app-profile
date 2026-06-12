import {
  takeEvery,
  put,
  call,
  all,
} from 'redux-saga/effects';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import * as profileActions from './actions';

jest.mock('./services', () => ({
  getPreferences: jest.fn(),
  getAccount: jest.fn(),
  getCourseCertificates: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// RootSaga and ProfileApiService must be imported AFTER the mock above.
/* eslint-disable import/first */
import profileSaga, {
  handleFetchProfile,
} from './sagas';
import * as ProfileApiService from './services';
/* eslint-enable import/first */

describe('RootSaga', () => {
  describe('profileSaga', () => {
    it('should pass actions to the correct sagas', () => {
      const gen = profileSaga();

      expect(gen.next().value)
        .toEqual(takeEvery(profileActions.FETCH_PROFILE.BASE, handleFetchProfile));

      expect(gen.next().value).toBeUndefined();
    });
  });

  describe('handleFetchProfile', () => {
    it('owner: fetches shared view + certs + preferences and gates certs to the public view', () => {
      getAuthenticatedUser.mockReturnValue({ username: 'gonzo' });
      const action = profileActions.fetchProfile('gonzo');
      const gen = handleFetchProfile(action);

      const sharedAccount = { username: 'gonzo', bio: 'shared bio' };
      const result = [sharedAccount, [1, 2, 3], { visibilityCourseCertificates: 'all_users' }];

      expect(gen.next().value).toEqual(put(profileActions.fetchProfileBegin()));
      // The owner can read their own preferences, so all three calls are made.
      expect(gen.next().value).toEqual(all([
        call(ProfileApiService.getAccount, 'gonzo', { sharedView: true }),
        call(ProfileApiService.getCourseCertificates, 'gonzo'),
        call(ProfileApiService.getPreferences, 'gonzo'),
      ]));
      // Renders as a visitor: empty preferences, isAuthenticatedUserProfile false.
      expect(gen.next(result).value)
        .toEqual(put(profileActions.fetchProfileSuccess(sharedAccount, {}, [1, 2, 3], false)));
      expect(gen.next().value).toEqual(put(profileActions.fetchProfileReset()));
      expect(gen.next().value).toBeUndefined();
    });

    it('owner: hides certificates that are not shared with everyone', () => {
      getAuthenticatedUser.mockReturnValue({ username: 'gonzo' });
      const action = profileActions.fetchProfile('gonzo');
      const gen = handleFetchProfile(action);

      const sharedAccount = { username: 'gonzo' };
      const result = [sharedAccount, [1, 2, 3], { visibilityCourseCertificates: 'private' }];

      expect(gen.next().value).toEqual(put(profileActions.fetchProfileBegin()));
      expect(gen.next().value).toEqual(all([
        call(ProfileApiService.getAccount, 'gonzo', { sharedView: true }),
        call(ProfileApiService.getCourseCertificates, 'gonzo'),
        call(ProfileApiService.getPreferences, 'gonzo'),
      ]));
      expect(gen.next(result).value)
        .toEqual(put(profileActions.fetchProfileSuccess(sharedAccount, {}, [], false)));
      expect(gen.next().value).toEqual(put(profileActions.fetchProfileReset()));
      expect(gen.next().value).toBeUndefined();
    });

    it('visitor: does not fetch preferences (would 403) and trusts the certificates API', () => {
      getAuthenticatedUser.mockReturnValue({ username: 'someone-else' });
      const action = profileActions.fetchProfile('gonzo');
      const gen = handleFetchProfile(action);

      const sharedAccount = { username: 'gonzo', bio: 'shared bio' };
      const result = [sharedAccount, [1, 2, 3]];

      expect(gen.next().value).toEqual(put(profileActions.fetchProfileBegin()));
      // Only two calls for a non-owner -- no getPreferences (it would 403).
      expect(gen.next().value).toEqual(all([
        call(ProfileApiService.getAccount, 'gonzo', { sharedView: true }),
        call(ProfileApiService.getCourseCertificates, 'gonzo'),
      ]));
      // The certs API already returned only publicly-shared certs, so pass through as-is.
      expect(gen.next(result).value)
        .toEqual(put(profileActions.fetchProfileSuccess(sharedAccount, {}, [1, 2, 3], false)));
      expect(gen.next().value).toEqual(put(profileActions.fetchProfileReset()));
      expect(gen.next().value).toBeUndefined();
    });

    it('never patches preferences (the read-only page must not mutate the viewer)', () => {
      getAuthenticatedUser.mockReturnValue({ username: 'gonzo' });
      const action = profileActions.fetchProfile('gonzo');
      const gen = handleFetchProfile(action);

      // Drive the whole generator and collect every yielded effect.
      const yields = [];
      const sharedAccount = { username: 'gonzo', accountPrivacy: 'all_users' };
      const result = [sharedAccount, [1, 2, 3], { visibilityCourseCertificates: 'all_users' }];

      let step = gen.next();
      yields.push(step.value);
      step = gen.next(); // fetchProfileBegin -> all([...])
      yields.push(step.value);
      step = gen.next(result); // all([...]) -> fetchProfileSuccess
      while (!step.done) {
        yields.push(step.value);
        step = gen.next();
      }

      // No yielded effect may reference a patchPreferences service call.
      const serialized = JSON.stringify(yields);
      expect(serialized).not.toContain('patchPreferences');
      // Defensive: the service mock doesn't even expose patchPreferences anymore.
      expect(ProfileApiService.patchPreferences).toBeUndefined();
    });

    it('redirects to not found on a 404', () => {
      getAuthenticatedUser.mockReturnValue({ username: 'gonzo' });
      const action = profileActions.fetchProfile('ghost');
      const gen = handleFetchProfile(action);

      const error = new Error('not found');
      error.response = { status: 404 };
      error.customAttributes = { httpErrorStatus: 404 };

      gen.next(); // fetchProfileBegin
      gen.next(); // all([...])
      const result = gen.throw(error);
      expect(result.value).toEqual(put(profileActions.fetchProfileFailure({ httpErrorStatus: 404 })));
      expect(gen.next().value).toBeUndefined();
    });
  });
});
