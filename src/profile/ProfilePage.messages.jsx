import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'profile.viewMyRecords': {
    id: 'profile.viewMyRecords',
    defaultMessage: 'View My Records',
    description: 'A link to go view my academic records',
  },
  'profile.loading': {
    id: 'profile.loading',
    defaultMessage: 'Profile loading...',
    description: 'Message displayed when the profile data is loading.',
  },
  'profile.preview.button': {
    id: 'profile.preview.button',
    defaultMessage: 'View what public sees',
    description: 'A link to preview your own profile the way other users see it',
  },
  'profile.preview.banner': {
    id: 'profile.preview.banner',
    // Keep this a plain, self-contained string: no ICU placeholders ({foo})
    // and no rich-text tags (<b>...</b>). Either of those requires a matching
    // `values` entry at the call site, and a missing one makes react-intl
    // render the literal token "<unknown>" in place of the missing piece.
    defaultMessage: 'This is a preview of how your profile appears to other signed-in users.',
    description: 'Banner shown while previewing your own profile as other users see it',
  },
  'profile.preview.exit': {
    id: 'profile.preview.exit',
    defaultMessage: 'Exit preview',
    description: 'A link that leaves the public preview of your own profile and returns to the editable profile',
  },
});

export default messages;
