import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { ReactComponent as DefaultAvatar } from '../assets/avatar.svg';

import messages from './ProfileAvatar.messages';

class ProfileAvatar extends React.Component {
  renderAvatar() {
    const { intl } = this.props;

    return this.props.isDefault ? (
      <DefaultAvatar className="text-muted" role="img" aria-hidden focusable="false" viewBox="0 0 24 24" />
    ) : (
      <img
        data-hj-suppress
        className="w-100 h-100 d-block rounded-circle overflow-hidden"
        style={{ objectFit: 'cover' }}
        alt={intl.formatMessage(messages['profile.image.alt.attribute'])}
        src={this.props.src}
      />
    );
  }

  render() {
    return (
      <div className="profile-avatar-wrap position-relative">
        <div className="profile-avatar rounded-circle bg-light">
          {this.renderAvatar()}
        </div>
      </div>
    );
  }
}

export default injectIntl(ProfileAvatar);

ProfileAvatar.propTypes = {
  src: PropTypes.string,
  isDefault: PropTypes.bool,
  intl: intlShape.isRequired,
};

ProfileAvatar.defaultProps = {
  src: null,
  isDefault: true,
};
