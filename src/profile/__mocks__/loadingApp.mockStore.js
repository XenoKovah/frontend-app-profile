module.exports = {
  userAccount: {
    loading: false,
    error: null,
    username: 'staff',
    email: null,
    bio: null,
    name: null,
    country: null,
    socialLinks: null,
    profileImage: {
      imageUrlMedium: null,
      imageUrlLarge: null
    },
    levelOfEducation: null,
    learningGoal: null
  },
  profilePage: {
    errors: {},
    saveState: null,
    account: {
      username: 'staff',
      socialLinks: []
    },
    preferences: {},
    courseCertificates: [],
    isLoadingProfile: true,
    isAuthenticatedUserProfile: false,
  },
  router: {
    location: {
      pathname: '/u/staff',
      search: '',
      hash: ''
    },
    action: 'POP'
  }
};
