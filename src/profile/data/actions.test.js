import {
  FETCH_PROFILE,
  fetchProfile,
  fetchProfileBegin,
  fetchProfileSuccess,
  fetchProfileReset,
  fetchProfileFailure,
} from './actions';

describe('FETCH profile actions', () => {
  it('should create an action to fetch a profile', () => {
    const expectedAction = {
      type: FETCH_PROFILE.BASE,
      payload: { username: 'staff' },
    };
    expect(fetchProfile('staff')).toEqual(expectedAction);
  });

  it('should create an action to signal the start of a profile fetch', () => {
    const expectedAction = {
      type: FETCH_PROFILE.BEGIN,
    };
    expect(fetchProfileBegin()).toEqual(expectedAction);
  });

  it('should create an action to signal a successful profile fetch', () => {
    const account = { name: 'Full Name' };
    const preferences = {};
    const courseCertificates = [];
    const expectedAction = {
      type: FETCH_PROFILE.SUCCESS,
      account,
      preferences,
      courseCertificates,
      isAuthenticatedUserProfile: false,
    };
    expect(fetchProfileSuccess(account, preferences, courseCertificates, false)).toEqual(expectedAction);
  });

  it('should create an action to reset the profile fetch state', () => {
    const expectedAction = {
      type: FETCH_PROFILE.RESET,
    };
    expect(fetchProfileReset()).toEqual(expectedAction);
  });

  it('should create an action to signal a failed profile fetch', () => {
    const errors = ['Test failure'];
    const expectedAction = {
      type: FETCH_PROFILE.FAILURE,
      payload: { errors },
    };
    expect(fetchProfileFailure(errors)).toEqual(expectedAction);
  });
});
