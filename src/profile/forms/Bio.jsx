import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './Bio.messages';

// Components
import EditableItemHeader from './elements/EditableItemHeader';
import SwitchContent from './elements/SwitchContent';

// Selectors
import { editableFormSelector } from '../data/selectors';

class Bio extends React.Component {
  render() {
    const {
      editMode, bio, intl,
    } = this.props;

    return (
      <SwitchContent
        className="mb-5"
        expression={editMode}
        cases={{
          static: (
            <>
              <EditableItemHeader content={intl.formatMessage(messages['profile.bio.about.me'])} />
              <p data-hj-suppress className="lead">{bio}</p>
            </>
          ),
        }}
      />
    );
  }
}

Bio.propTypes = {
  // From Selector
  bio: PropTypes.string,
  editMode: PropTypes.oneOf(['static']),

  // i18n
  intl: intlShape.isRequired,
};

Bio.defaultProps = {
  editMode: 'static',
  bio: null,
};

export default connect(
  editableFormSelector,
  {},
)(injectIntl(Bio));
