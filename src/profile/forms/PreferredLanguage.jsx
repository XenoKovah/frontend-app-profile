import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './PreferredLanguage.messages';

// Components
import EditableItemHeader from './elements/EditableItemHeader';
import SwitchContent from './elements/SwitchContent';

// Selectors
import { preferredLanguageSelector } from '../data/selectors';

class PreferredLanguage extends React.Component {
  render() {
    const {
      editMode,
      languageProficiencies,
      intl,
      languageMessages,
    } = this.props;

    const value = languageProficiencies.length ? languageProficiencies[0].code : '';

    return (
      <SwitchContent
        className="mb-5"
        expression={editMode}
        cases={{
          static: (
            <>
              <EditableItemHeader
                content={intl.formatMessage(messages['profile.preferredlanguage.label'])}
              />
              <p data-hj-suppress className="h5">{languageMessages[value]}</p>
            </>
          ),
        }}
      />
    );
  }
}

PreferredLanguage.propTypes = {
  // From Selector
  languageProficiencies: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string })),
    // TODO: ProfilePageSelector should supply null values
    // instead of empty strings when no value exists
    PropTypes.oneOf(['']),
  ]),
  editMode: PropTypes.oneOf(['static']),
  languageMessages: PropTypes.objectOf(PropTypes.string).isRequired,

  // i18n
  intl: intlShape.isRequired,
};

PreferredLanguage.defaultProps = {
  editMode: 'static',
  languageProficiencies: [],
};

export default connect(
  preferredLanguageSelector,
  {},
)(injectIntl(PreferredLanguage));
