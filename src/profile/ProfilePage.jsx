import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

// Actions
import { fetchProfile } from './data/actions';

// Components
import ProfileAvatar from './forms/ProfileAvatar';
import Name from './forms/Name';
import Country from './forms/Country';
import PreferredLanguage from './forms/PreferredLanguage';
import Education from './forms/Education';
import SocialLinks from './forms/SocialLinks';
import Bio from './forms/Bio';
import Certificates from './forms/Certificates';
import DateJoined from './DateJoined';
import UsernameDescription from './UsernameDescription';
import PageLoading from './PageLoading';
import Banner from './Banner';
import LearningGoal from './forms/LearningGoal';

// Selectors
import { profilePageSelector } from './data/selectors';

// i18n
import messages from './ProfilePage.messages';

import withParams from '../utils/hoc';

ensureConfig(['CREDENTIALS_BASE_URL', 'LMS_BASE_URL'], 'ProfilePage');

class ProfilePage extends React.Component {
  componentDidMount() {
    this.props.fetchProfile(this.props.params.username);
    sendTrackingLogEvent('edx.profile.viewed', {
      username: this.props.params.username,
    });
  }

  isYOBDisabled() {
    const { yearOfBirth } = this.props;
    const currentYear = new Date().getFullYear();
    const isAgeOrNotCompliant = !yearOfBirth || ((currentYear - yearOfBirth) < 13);

    return isAgeOrNotCompliant && getConfig().COLLECT_YEAR_OF_BIRTH !== 'true';
  }

  // Inserted into the DOM in two places (for responsive layout)
  renderHeadingLockup() {
    const { dateJoined } = this.props;

    return (
      <span data-hj-suppress>
        <h1 className="h2 mb-0 font-weight-bold text-truncate">{this.props.params.username}</h1>
        <DateJoined date={dateJoined} />
        {this.isYOBDisabled() && <UsernameDescription />}
        <hr className="d-none d-md-block" />
      </span>
    );
  }

  renderContent() {
    const {
      profileImage,
      name,
      visibilityName,
      country,
      visibilityCountry,
      levelOfEducation,
      visibilityLevelOfEducation,
      socialLinks,
      visibilitySocialLinks,
      learningGoal,
      visibilityLearningGoal,
      languageProficiencies,
      visibilityLanguageProficiencies,
      courseCertificates,
      visibilityCourseCertificates,
      bio,
      visibilityBio,
      isLoadingProfile,
      username,
      saveState,
      navigate,
    } = this.props;

    if (isLoadingProfile) {
      return <PageLoading srMessage={this.props.intl.formatMessage(messages['profile.loading'])} />;
    }

    if (!username && saveState === 'error' && navigate) {
      navigate('/notfound');
    }

    // The profile is read-only and only ever shows the public view, so a block is
    // visible exactly when it has a value to show.
    const isBlockVisible = (blockInfo) => Boolean(blockInfo);

    const isLanguageBlockVisible = isBlockVisible(languageProficiencies.length);
    const isEducationBlockVisible = isBlockVisible(levelOfEducation);
    const isSocialLinksBLockVisible = isBlockVisible(socialLinks.some((link) => link.socialLink !== null));
    const isBioBlockVisible = isBlockVisible(bio);
    const isCertificatesBlockVisible = isBlockVisible(courseCertificates.length);
    const isNameBlockVisible = isBlockVisible(name);
    const isLocationBlockVisible = isBlockVisible(country);

    return (
      <div className="container-fluid">
        <div className="row align-items-center pt-4 mb-4 pt-md-0 mb-md-0">
          <div className="col-auto col-md-4 col-lg-3">
            <div className="d-flex align-items-center d-md-block">
              <ProfileAvatar
                className="mb-md-3"
                src={profileImage.src}
                isDefault={profileImage.isDefault}
              />
            </div>
          </div>
          <div className="col">
            <div className="d-md-none">
              {this.renderHeadingLockup()}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 col-lg-4">
            <div className="d-none d-md-block mb-4">
              {this.renderHeadingLockup()}
            </div>
            {isNameBlockVisible && (
              <Name
                name={name}
                visibilityName={visibilityName}
                formId="name"
              />
            )}
            {isLocationBlockVisible && (
              <Country
                country={country}
                visibilityCountry={visibilityCountry}
                formId="country"
              />
            )}
            {isLanguageBlockVisible && (
              <PreferredLanguage
                languageProficiencies={languageProficiencies}
                visibilityLanguageProficiencies={visibilityLanguageProficiencies}
                formId="languageProficiencies"
              />
            )}
            {isEducationBlockVisible && (
              <Education
                levelOfEducation={levelOfEducation}
                visibilityLevelOfEducation={visibilityLevelOfEducation}
                formId="levelOfEducation"
              />
            )}
            {isSocialLinksBLockVisible && (
              <SocialLinks
                socialLinks={socialLinks}
                visibilitySocialLinks={visibilitySocialLinks}
                formId="socialLinks"
              />
            )}
            <div className="mb-4">
              <PluginSlot id="org.openedx.frontend.profile.additional_profile_fields.v1" />
            </div>
          </div>
          <div className="pt-md-3 col-md-8 col-lg-7 offset-lg-1">
            {isBioBlockVisible && (
              <Bio
                bio={bio}
                visibilityBio={visibilityBio}
                formId="bio"
              />
            )}
            {getConfig().ENABLE_SKILLS_BUILDER_PROFILE && (
              <LearningGoal
                learningGoal={learningGoal}
                visibilityLearningGoal={visibilityLearningGoal}
                formId="learningGoal"
              />
            )}
            {isCertificatesBlockVisible && (
              <Certificates
                visibilityCourseCertificates={visibilityCourseCertificates}
                formId="certificates"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="profile-page">
        <Banner />
        {this.renderContent()}
      </div>
    );
  }
}

ProfilePage.contextType = AppContext;

ProfilePage.propTypes = {
  // Account data
  dateJoined: PropTypes.string,
  username: PropTypes.string,

  // Bio form data
  bio: PropTypes.string,
  yearOfBirth: PropTypes.number,
  visibilityBio: PropTypes.string.isRequired,

  // Certificates form data
  courseCertificates: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
  })),
  visibilityCourseCertificates: PropTypes.string.isRequired,

  // Country form data
  country: PropTypes.string,
  visibilityCountry: PropTypes.string.isRequired,

  // Education form data
  levelOfEducation: PropTypes.string,
  visibilityLevelOfEducation: PropTypes.string.isRequired,

  // Language proficiency form data
  languageProficiencies: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
  })),
  visibilityLanguageProficiencies: PropTypes.string.isRequired,

  // Name form data
  name: PropTypes.string,
  visibilityName: PropTypes.string.isRequired,

  // Social links form data
  socialLinks: PropTypes.arrayOf(PropTypes.shape({
    platform: PropTypes.string,
    socialLink: PropTypes.string,
  })),
  visibilitySocialLinks: PropTypes.string.isRequired,

  // Learning Goal form data
  learningGoal: PropTypes.string,
  visibilityLearningGoal: PropTypes.string.isRequired,

  // Other data we need
  profileImage: PropTypes.shape({
    src: PropTypes.string,
    isDefault: PropTypes.bool,
  }),
  saveState: PropTypes.oneOf([null, 'pending', 'complete', 'error']),
  isLoadingProfile: PropTypes.bool.isRequired,

  // Actions
  fetchProfile: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,

  // Router
  params: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,

  // i18n
  intl: intlShape.isRequired,
};

ProfilePage.defaultProps = {
  saveState: null,
  username: '',
  profileImage: {},
  name: null,
  yearOfBirth: null,
  levelOfEducation: null,
  country: null,
  socialLinks: [],
  bio: null,
  learningGoal: null,
  languageProficiencies: [],
  courseCertificates: null,
  dateJoined: null,
};

export default connect(
  profilePageSelector,
  {
    fetchProfile,
  },
)(injectIntl(withParams(ProfilePage)));
