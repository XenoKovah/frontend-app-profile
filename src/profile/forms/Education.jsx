import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import get from 'lodash.get';

import messages from './Education.messages';

// Components
import EditableItemHeader from './elements/EditableItemHeader';
import SwitchContent from './elements/SwitchContent';

// Selectors
import { editableFormSelector } from '../data/selectors';

class Education extends React.Component {
  render() {
    const {
      editMode, levelOfEducation, intl,
    } = this.props;

    return (
      <SwitchContent
        className="mb-5"
        expression={editMode}
        cases={{
          static: (
            <>
              <EditableItemHeader content={intl.formatMessage(messages['profile.education.education'])} />
              <p data-hj-suppress className="h5">
                {intl.formatMessage(get(
                  messages,
                  `profile.education.levels.${levelOfEducation}`,
                  messages['profile.education.levels.o'],
                ))}
              </p>
            </>
          ),
        }}
      />
    );
  }
}

Education.propTypes = {
  // From Selector
  levelOfEducation: PropTypes.string,
  editMode: PropTypes.oneOf(['static']),

  // i18n
  intl: intlShape.isRequired,
};

Education.defaultProps = {
  editMode: 'static',
  levelOfEducation: null,
};

export default connect(
  editableFormSelector,
  {},
)(injectIntl(Education));
