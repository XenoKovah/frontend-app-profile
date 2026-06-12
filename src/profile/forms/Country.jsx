import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './Country.messages';

// Components
import EditableItemHeader from './elements/EditableItemHeader';
import SwitchContent from './elements/SwitchContent';

// Selectors
import { countrySelector } from '../data/selectors';

class Country extends React.Component {
  /**
   * Render the learner's location as a link to that country's leaderboard.
   *
   * The displayed value is only ever populated for a country the viewer is allowed
   * to see, so the link is shown exactly when the location itself is shown. The
   * leaderboard lives on the LMS (the gamma_dashboard plugin), hence the absolute
   * LMS_BASE_URL; the path carries the 2-letter ISO code that the country dropdown
   * already stores. When there is no location, the value is rendered as before.
   */
  renderCountryValue() {
    const { country, countryMessages, intl } = this.props;
    const countryName = countryMessages[country];

    if (!country || !countryName) {
      return <p data-hj-suppress className="h5">{countryName}</p>;
    }

    const leaderboardUrl = `${getConfig().LMS_BASE_URL}/gamma_dashboard/leaderboard/country/${country}`;
    return (
      <p data-hj-suppress className="h5">
        <a
          href={leaderboardUrl}
          title={intl.formatMessage(messages['profile.country.leaderboard.link'], { country: countryName })}
        >
          {countryName}
        </a>
      </p>
    );
  }

  render() {
    const {
      editMode,
      intl,
    } = this.props;

    return (
      <SwitchContent
        className="mb-5"
        expression={editMode}
        cases={{
          static: (
            <>
              <EditableItemHeader
                content={intl.formatMessage(messages['profile.country.label'])}
              />
              {this.renderCountryValue()}
            </>
          ),
        }}
      />
    );
  }
}

Country.propTypes = {
  // From Selector
  country: PropTypes.string,
  editMode: PropTypes.oneOf(['static']),
  countryMessages: PropTypes.objectOf(PropTypes.string).isRequired,

  // i18n
  intl: intlShape.isRequired,
};

Country.defaultProps = {
  editMode: 'static',
  country: null,
};

export default connect(
  countrySelector,
  {},
)(injectIntl(Country));
