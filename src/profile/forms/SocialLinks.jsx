import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXTwitter, faLinkedin, faBluesky, faDiscord, faGithub, faGitlab, faMastodon,
} from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './SocialLinks.messages';

// Components
import EditableItemHeader from './elements/EditableItemHeader';
import SwitchContent from './elements/SwitchContent';

// Selectors
import { editableFormSelector } from '../data/selectors';

const platformDisplayInfo = {
  blog: {
    icon: faGlobe,
    name: 'Blog',
  },
  linkedin: {
    icon: faLinkedin,
    name: 'LinkedIn',
  },
  github: {
    icon: faGithub,
    name: 'GitHub',
  },
  gitlab: {
    icon: faGitlab,
    name: 'GitLab',
  },
  mastodon: {
    icon: faMastodon,
    name: 'Mastodon',
  },
  bluesky: {
    icon: faBluesky,
    name: 'Bluesky',
  },
  twitter: {
    icon: faXTwitter,
    name: 'X',
  },
  discord: {
    icon: faDiscord,
    name: 'Discord',
  },
};

// Defense in depth: the backend only stores validated http(s) links, but the
// profile MFE must never turn a profile-supplied value into a clickable link
// unless it is clearly an http(s) URL. Otherwise a stored javascript:/data:
// value could run script against whoever (including staff) clicks it.
const isSafeHttpUrl = (value) => {
  if (typeof value !== 'string') {
    return false;
  }
  // Drop the whitespace/control chars browsers ignore when resolving a scheme.
  const cleaned = Array.from(value)
    .filter((ch) => ch.charCodeAt(0) > 0x20 && ch.charCodeAt(0) !== 0x7f)
    .join('')
    .toLowerCase();
  return cleaned.startsWith('http://') || cleaned.startsWith('https://');
};

const SocialLink = ({ url, name, platform }) => {
  const platformInfo = platformDisplayInfo[platform];
  const icon = platformInfo
    ? <FontAwesomeIcon className="mr-2" icon={platformInfo.icon} />
    : null;

  if (!isSafeHttpUrl(url)) {
    return <span className="font-weight-bold">{icon}{name}</span>;
  }

  return (
    <a href={url} className="font-weight-bold text-break" rel="nofollow noopener noreferrer ugc">
      {icon}
      {url}
    </a>
  );
};

SocialLink.propTypes = {
  url: PropTypes.string.isRequired,
  platform: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const StaticListItem = ({ name, url, platform }) => (
  <li className="mb-2">
    <SocialLink name={name} url={url} platform={platform} />
  </li>
);

StaticListItem.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
  platform: PropTypes.string.isRequired,
};

StaticListItem.defaultProps = {
  url: null,
};

class SocialLinks extends React.Component {
  render() {
    const {
      socialLinks, editMode, intl,
    } = this.props;

    return (
      <SwitchContent
        className="mb-5"
        expression={editMode}
        cases={{
          static: (
            <>
              <EditableItemHeader
                content={intl.formatMessage(messages['profile.sociallinks.social.links'])}
              />
              {/* social-links-static opts this multi-value list out of the stock
                  "show only the first <li>" rule -- see profile/index.scss */}
              <ul className="list-unstyled social-links-static">
                {socialLinks
                  .filter(({ socialLink }) => Boolean(socialLink))
                  .map(({ platform, socialLink }) => (
                    <StaticListItem
                      key={platform}
                      name={platformDisplayInfo[platform].name}
                      url={socialLink}
                      platform={platform}
                    />
                  ))}
              </ul>
            </>
          ),
        }}
      />
    );
  }
}

SocialLinks.propTypes = {
  // From Selector
  socialLinks: PropTypes.arrayOf(PropTypes.shape({
    platform: PropTypes.string,
    socialLink: PropTypes.string,
  })).isRequired,
  editMode: PropTypes.oneOf(['static']),

  // i18n
  intl: intlShape.isRequired,
};

SocialLinks.defaultProps = {
  editMode: 'static',
};

export default connect(
  editableFormSelector,
  {},
)(injectIntl(SocialLinks));
