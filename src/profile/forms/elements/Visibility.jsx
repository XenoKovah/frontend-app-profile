import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-regular-svg-icons';

import messages from './Visibility.messages';

const Visibility = ({ to, intl }) => {
  const icon = to === 'private' ? faEyeSlash : faEye;
  const label = to === 'private'
    ? intl.formatMessage(messages['profile.visibility.who.just.me'])
    : intl.formatMessage(messages['profile.visibility.who.everyone'], { siteName: getConfig().SITE_NAME });

  return (
    <span className="ml-auto small text-muted">
      <FontAwesomeIcon icon={icon} /> {label}
    </span>
  );
};

Visibility.propTypes = {
  to: PropTypes.oneOf(['private', 'all_users']),

  // i18n
  intl: intlShape.isRequired,
};
Visibility.defaultProps = {
  to: 'private',
};

const intlVisibility = injectIntl(Visibility);

export {
  intlVisibility as Visibility,
};
