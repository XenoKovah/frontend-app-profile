import {
  FETCH_PROFILE,
} from './actions';

export const initialState = {
  errors: {},
  saveState: null,
  account: {
    socialLinks: [],
  },
  preferences: {},
  courseCertificates: [],
  isLoadingProfile: true,
  isAuthenticatedUserProfile: false,
};

const profilePage = (state = initialState, action = {}) => {
  switch (action.type) {
    case FETCH_PROFILE.BEGIN:
      return {
        ...state,
        // TODO: uncomment this line after ARCH-438 Image Post API returns the url
        // is complete. Right now we refetch the whole profile causing us to show a full reload
        // instead of a partial one.
        // isLoadingProfile: true,
      };
    case FETCH_PROFILE.SUCCESS:
      return {
        ...state,
        account: action.account,
        preferences: action.preferences,
        courseCertificates: action.courseCertificates,
        isLoadingProfile: false,
        isAuthenticatedUserProfile: action.isAuthenticatedUserProfile,
      };
    case FETCH_PROFILE.FAILURE:
      return {
        ...state,
        saveState: 'error',
        isLoadingProfile: false,
        errors: { ...state.errors, ...action.payload.errors },
      };
    case FETCH_PROFILE.RESET:
      return {
        ...state,
        saveState: null,
        isLoadingProfile: false,
        errors: {},
      };
    default:
      return state;
  }
};

export default profilePage;
