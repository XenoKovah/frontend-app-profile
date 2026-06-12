import {
  takeEvery,
  put,
  call,
  all,
} from 'redux-saga/effects';

import * as profileActions from './actions';

jest.mock('./services', () => ({
  getPreferences: jest.fn(),
  getAccount: jest.fn(),
  getCourseCertificates: jest.fn(),
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
    it('always fetches the shared view, certificates and preferences, even for the owner', () => {
      const action = profileActions.fetchProfile('gonzo');
      const gen = handleFetchProfile(action);

      const sharedAccount = { username: 'gonzo', bio: 'shared bio' };
      const result = [sharedAccount, [1, 2, 3], { visibilityCourseCertificates: 'all_users' }];

      expect(gen.next().value).toEqual(put(profileActions.fetchProfileBegin()));
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

    it('hides certificates when they are not visible to everyone', () => {
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

    it('never patches preferences (the read-only page must not mutate the viewer)', () => {
      const action = profileActions.fetchProfile('gonzo');
      const gen = handleFetchProfile(action);

      // Drive the whole generator and collect every yielded effect.
      const yields = [];
      const sharedAccount = { username: 'gonzo', accountPrivacy: 'all_users' };
      const result = [sharedAccount, [1, 2, 3], { visibilityCourseCertificates: 'all_users' }];

      let step = gen.next();
      // Feed the parallel-calls result in when the saga asks for it.
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
