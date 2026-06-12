import { render, screen } from '@testing-library/react';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { configure as configureI18n, IntlProvider } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import SocialLinks from './SocialLinks';
import * as viewOwnProfile from '../__mocks__/viewOwnProfile.mockStore';
import messages from '../../i18n';

const mockStore = configureMockStore([thunk]);

const defaultProps = {
  formId: 'socialLinks',
  socialLinks: [
    {
      platform: 'twitter',
      socialLink: 'https://x.com/ALOHA',
    },
    {
      platform: 'linkedin',
      socialLink: 'https://www.linkedin.com/in/aloha',
    },
  ],
  editMode: 'static',
};

configureI18n({
  loggingService: { logError: jest.fn() },
  config: {
    ENVIRONMENT: 'production',
    LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
  },
  messages,
});

const SocialLinksWrapper = (props) => {
  const contextValue = useMemo(() => ({
    authenticatedUser: { userId: null, username: null, administrator: false },
    config: getConfig(),
  }), []);
  return (
    <AppContext.Provider
      value={contextValue}
    >
      <IntlProvider locale="en">
        <Provider store={props.store}>
          <SocialLinks {...props} />
        </Provider>
      </IntlProvider>
    </AppContext.Provider>
  );
};

SocialLinksWrapper.defaultProps = {
  store: mockStore(viewOwnProfile),
};

SocialLinksWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('<SocialLinks />', () => {
  it('renders the set links read-only', () => {
    const component = <SocialLinksWrapper {...defaultProps} />;
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });

  it('renders only the set links in static mode, without add buttons', () => {
    // Static mode is how everyone (including the owner) sees the profile: set
    // links render read-only and unset platforms show no "Add ..." buttons.
    render(
      <SocialLinksWrapper
        {...defaultProps}
        socialLinks={[
          ...defaultProps.socialLinks,
          // The page-level selector pads unset platforms with null stubs.
          { platform: 'blog', socialLink: null },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'https://x.com/ALOHA' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://www.linkedin.com/in/aloha' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Add / })).not.toBeInTheDocument();
  });
});
