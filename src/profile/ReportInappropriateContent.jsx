import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

// The report form is a server-rendered LMS page (it needs the LMS session/CSRF and sends
// the email), so this is a plain link rather than an in-MFE route.
const ReportInappropriateContent = ({ username }) => (
  <p className="mb-3 report-inappropriate-content">
    <a
      className="report-inappropriate-content__link"
      href={`${getConfig().LMS_BASE_URL}/report-user/${encodeURIComponent(username)}/`}
    >
      <span aria-hidden="true">⚠️</span>
      {' '}
      <FormattedMessage
        id="profile.report.inappropriate.content"
        defaultMessage="Report inappropriate content"
        description="Link on another user's profile to report inappropriate content on that account"
      />
    </a>
  </p>
);

ReportInappropriateContent.propTypes = {
  username: PropTypes.string.isRequired,
};

export default ReportInappropriateContent;
