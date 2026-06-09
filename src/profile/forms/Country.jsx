import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import messages from './Country.messages';

// Components
import FormControls from './elements/FormControls';
import EditableItemHeader from './elements/EditableItemHeader';
import EmptyContent from './elements/EmptyContent';
import SwitchContent from './elements/SwitchContent';

// Selectors
import { countrySelector } from '../data/selectors';

class Country extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }

  handleChange(e) {
    const {
      name,
      value,
    } = e.target;
    this.props.changeHandler(name, value);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.submitHandler(this.props.formId);
  }

  handleClose() {
    this.props.closeHandler(this.props.formId);
  }

  handleOpen() {
    this.props.openHandler(this.props.formId);
  }

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
      formId,
      country,
      visibilityCountry,
      editMode,
      saveState,
      error,
      intl,
      sortedCountries,
    } = this.props;

    return (
      <SwitchContent
        className="mb-5"
        expression={editMode}
        cases={{
          editing: (
            <div role="dialog" aria-labelledby={`${formId}-label`}>
              <form onSubmit={this.handleSubmit}>
                <Form.Group
                  controlId={formId}
                  isInvalid={error !== null}
                >
                  <label className="edit-section-header" htmlFor={formId}>
                    {intl.formatMessage(messages['profile.country.label'])}
                  </label>
                  <select
                    data-hj-suppress
                    className="form-control"
                    type="select"
                    id={formId}
                    name={formId}
                    value={country}
                    onChange={this.handleChange}
                  >
                    <option value="">&nbsp;</option>
                    {sortedCountries.map(({ code, name }) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  {error !== null && (
                    <Form.Control.Feedback hasIcon={false}>
                      {error}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <FormControls
                  visibilityId="visibilityCountry"
                  saveState={saveState}
                  visibility={visibilityCountry}
                  cancelHandler={this.handleClose}
                  changeHandler={this.handleChange}
                />
              </form>
            </div>
          ),
          editable: (
            <>
              <EditableItemHeader
                content={intl.formatMessage(messages['profile.country.label'])}
                showEditButton
                onClickEdit={this.handleOpen}
                showVisibility={visibilityCountry !== null}
                visibility={visibilityCountry}
              />
              {this.renderCountryValue()}
            </>
          ),
          empty: (
            <>
              <EditableItemHeader
                content={intl.formatMessage(messages['profile.country.label'])}
              />
              <EmptyContent onClick={this.handleOpen}>
                {intl.formatMessage(messages['profile.country.empty'])}
              </EmptyContent>
            </>
          ),
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
  // It'd be nice to just set this as a defaultProps...
  // except the class that comes out on the other side of react-redux's
  // connect() method won't have it anymore. Static properties won't survive
  // through the higher order function.
  formId: PropTypes.string.isRequired,

  // From Selector
  country: PropTypes.string,
  visibilityCountry: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  error: PropTypes.string,
  sortedCountries: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  countryMessages: PropTypes.objectOf(PropTypes.string).isRequired,

  // Actions
  changeHandler: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,

  // i18n
  intl: intlShape.isRequired,
};

Country.defaultProps = {
  editMode: 'static',
  saveState: null,
  country: null,
  visibilityCountry: 'private',
  error: null,
};

export default connect(
  countrySelector,
  {},
)(injectIntl(Country));
