import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'profile.country.label': {
    id: 'profile.country.label',
    defaultMessage: 'Location',
    description: 'The label for a country in a user profile.',
  },
  'profile.country.empty': {
    id: 'profile.country.empty',
    defaultMessage: 'Add location',
    description: 'The affordance to add country location to a user’s profile.',
  },
  'profile.country.leaderboard.link': {
    id: 'profile.country.leaderboard.link',
    defaultMessage: 'View the {country} leaderboard',
    description: 'Accessible label/tooltip for the link from a profile location to that country’s leaderboard page.',
  },
});

export default messages;
