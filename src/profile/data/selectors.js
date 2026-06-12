import { createSelector } from 'reselect';
import {
  getLocale,
  getLanguageList,
  getCountryList,
  getCountryMessages,
  getLanguageMessages,
} from '@edx/frontend-platform/i18n'; // eslint-disable-line

export const formIdSelector = (state, props) => props.formId;
export const userAccountSelector = state => state.userAccount;

export const profileAccountSelector = state => state.profilePage.account;
export const accountPrivacySelector = state => state.profilePage.preferences.accountPrivacy;
export const profilePreferencesSelector = state => state.profilePage.preferences;
export const profileCourseCertificatesSelector = state => state.profilePage.courseCertificates;
export const saveStateSelector = state => state.profilePage.saveState;
export const isLoadingProfileSelector = state => state.profilePage.isLoadingProfile;
export const accountErrorsSelector = state => state.profilePage.errors;
// The profile is read-only for everyone (the owner sees exactly what the public
// sees), so no form is ever editable.
export const isAuthenticatedUserProfileSelector = () => false;

// Every form renders read-only.
export const editableFormModeSelector = () => 'static';

// Note: Error messages are delivered from the server
// localized according to a user's account settings
export const formErrorSelector = createSelector(
  accountErrorsSelector,
  formIdSelector,
  (errors, formId) => (errors[formId] ? errors[formId].userMessage : null),
);

export const editableFormSelector = createSelector(
  editableFormModeSelector,
  formErrorSelector,
  saveStateSelector,
  (editMode, error, saveState) => ({
    editMode,
    error,
    saveState,
  }),
);

// Because this selector has no input selectors, it will only be evaluated once.  This is fine
// for now because we don't allow users to change the locale after page load.
// Once we DO allow this, we should create an actual action which dispatches the locale into redux,
// then we can modify this to get the locale from state rather than from getLocale() directly.
// Once we do that, this will work as expected and be re-evaluated when the locale changes.
export const localeSelector = () => getLocale();
export const countryMessagesSelector = createSelector(
  localeSelector,
  locale => getCountryMessages(locale),
);
export const languageMessagesSelector = createSelector(
  localeSelector,
  locale => getLanguageMessages(locale),
);

export const sortedLanguagesSelector = createSelector(
  localeSelector,
  locale => getLanguageList(locale),
);

export const sortedCountriesSelector = createSelector(
  localeSelector,
  locale => getCountryList(locale),
);

export const preferredLanguageSelector = createSelector(
  editableFormSelector,
  sortedLanguagesSelector,
  languageMessagesSelector,
  (editableForm, sortedLanguages, languageMessages) => ({
    ...editableForm,
    sortedLanguages,
    languageMessages,
  }),
);

export const countrySelector = createSelector(
  editableFormSelector,
  sortedCountriesSelector,
  countryMessagesSelector,
  (editableForm, sortedCountries, countryMessages) => ({
    ...editableForm,
    sortedCountries,
    countryMessages,
  }),
);

export const certificatesSelector = createSelector(
  editableFormSelector,
  profileCourseCertificatesSelector,
  (editableForm, certificates) => ({
    ...editableForm,
    certificates,
    value: certificates,
  }),
);

export const profileImageSelector = createSelector(
  profileAccountSelector,
  account => (account.profileImage != null
    ? {
      src: account.profileImage.imageUrlFull,
      isDefault: !account.profileImage.hasImage,
    }
    : {}),
);

// Reformats the social links in a platform-keyed hash.
const socialLinksByPlatformSelector = createSelector(
  profileAccountSelector,
  (account) => {
    const linksByPlatform = {};
    if (Array.isArray(account.socialLinks)) {
      account.socialLinks.forEach((socialLink) => {
        linksByPlatform[socialLink.platform] = socialLink;
      });
    }
    return linksByPlatform;
  },
);

// Fleshes out our list of existing social links with all the other ones the profile can have.
export const formSocialLinksSelector = createSelector(
  socialLinksByPlatformSelector,
  (linksByPlatform) => {
    const knownPlatforms = ['blog', 'linkedin', 'github', 'gitlab', 'mastodon', 'bluesky', 'twitter', 'discord'];
    const socialLinks = [];
    // For each known platform
    knownPlatforms.forEach((platform) => {
      if (linksByPlatform[platform] !== undefined) {
        // Use the real one.
        socialLinks.push(linksByPlatform[platform]);
      } else {
        // And if it's not present, use a stub.
        socialLinks.push({
          platform,
          socialLink: null,
        });
      }
    });
    return socialLinks;
  },
);

export const visibilitiesSelector = createSelector(
  profilePreferencesSelector,
  accountPrivacySelector,
  (preferences, accountPrivacy) => {
    switch (accountPrivacy) {
      case 'custom':
        return {
          visibilityBio: preferences.visibilityBio || 'all_users',
          visibilityCourseCertificates: preferences.visibilityCourseCertificates || 'all_users',
          visibilityCountry: preferences.visibilityCountry || 'all_users',
          visibilityLevelOfEducation: preferences.visibilityLevelOfEducation || 'all_users',
          visibilityLanguageProficiencies: preferences.visibilityLanguageProficiencies || 'all_users',
          visibilityName: preferences.visibilityName || 'all_users',
          visibilitySocialLinks: preferences.visibilitySocialLinks || 'all_users',
        };
      case 'private':
        return {
          visibilityBio: 'private',
          visibilityCourseCertificates: 'private',
          visibilityCountry: 'private',
          visibilityLevelOfEducation: 'private',
          visibilityLanguageProficiencies: 'private',
          visibilityName: 'private',
          visibilitySocialLinks: 'private',
        };
      case 'all_users':
      default:
        // All users is intended to fall through to default.
        // If there is no value for accountPrivacy in perferences, that means it has not been
        // explicitly set yet. The server assumes - today - that this means "all_users",
        // so we emulate that here in the client.
        return {
          visibilityBio: 'all_users',
          visibilityCourseCertificates: 'all_users',
          visibilityCountry: 'all_users',
          visibilityLevelOfEducation: 'all_users',
          visibilityLanguageProficiencies: 'all_users',
          visibilityName: 'all_users',
          visibilitySocialLinks: 'all_users',
        };
    }
  },
);

export const formValuesSelector = createSelector(
  profileAccountSelector,
  visibilitiesSelector,
  profileCourseCertificatesSelector,
  formSocialLinksSelector,
  (account, visibilities, courseCertificates, socialLinks) => ({
    bio: account.bio,
    visibilityBio: visibilities.visibilityBio,
    courseCertificates,
    visibilityCourseCertificates: visibilities.visibilityCourseCertificates,
    country: account.country,
    visibilityCountry: visibilities.visibilityCountry,
    levelOfEducation: account.levelOfEducation,
    visibilityLevelOfEducation: visibilities.visibilityLevelOfEducation,
    languageProficiencies: account.languageProficiencies,
    visibilityLanguageProficiencies: visibilities.visibilityLanguageProficiencies,
    name: account.name,
    visibilityName: visibilities.visibilityName,
    socialLinks, // Social links is calculated in its own selector, since it's complicated.
    visibilitySocialLinks: visibilities.visibilitySocialLinks,
  }),
);

export const profilePageSelector = createSelector(
  profileAccountSelector,
  formValuesSelector,
  profileImageSelector,
  saveStateSelector,
  isLoadingProfileSelector,
  (
    account,
    formValues,
    profileImage,
    saveState,
    isLoadingProfile,
  ) => ({
    // Account data we need
    username: account.username,
    profileImage,
    dateJoined: account.dateJoined,
    yearOfBirth: account.yearOfBirth,

    // Bio form data
    bio: formValues.bio,
    visibilityBio: formValues.visibilityBio,

    // Certificates form data
    courseCertificates: formValues.courseCertificates,
    visibilityCourseCertificates: formValues.visibilityCourseCertificates,

    // Country form data
    country: formValues.country,
    visibilityCountry: formValues.visibilityCountry,

    // Education form data
    levelOfEducation: formValues.levelOfEducation,
    visibilityLevelOfEducation: formValues.visibilityLevelOfEducation,

    // Language proficiency form data
    languageProficiencies: formValues.languageProficiencies,
    visibilityLanguageProficiencies: formValues.visibilityLanguageProficiencies,

    // Name form data
    name: formValues.name,
    visibilityName: formValues.visibilityName,

    // Social links form data
    socialLinks: formValues.socialLinks,
    visibilitySocialLinks: formValues.visibilitySocialLinks,

    // Other data we need
    saveState,
    isLoadingProfile,
  }),
);
