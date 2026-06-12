import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './Name.messages';

// Components
import EditableItemHeader from './elements/EditableItemHeader';
import SwitchContent from './elements/SwitchContent';

// Selectors
import { editableFormSelector } from '../data/selectors';

class Name extends React.Component {
  render() {
    const {
      editMode, name, intl,
    } = this.props;

    return (
      <SwitchContent
        className="mb-5"
        expression={editMode}
        cases={{
          static: (
            <>
              <EditableItemHeader content={intl.formatMessage(messages['profile.name.full.name'])} />
              <p data-hj-suppress className="h5">{name}</p>
            </>
          ),
        }}
      />
    );
  }
}

Name.propTypes = {
  // From Selector
  name: PropTypes.string,
  editMode: PropTypes.oneOf(['static']),

  // i18n
  intl: intlShape.isRequired,
};

Name.defaultProps = {
  editMode: 'static',
  name: null,
};

export default connect(
  editableFormSelector,
  {},
)(injectIntl(Name));
