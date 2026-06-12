import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient as getHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '../utils';

ensureConfig(['LMS_BASE_URL'], 'Profile API service');

function processAccountData(data) {
  return camelCaseObject(data);
}

// GET ACCOUNT
export async function getAccount(username, { sharedView = false } = {}) {
  // view=shared makes the accounts API return only the fields other logged-in
  // users can see, even when requesting your own account.
  const query = sharedView ? '?view=shared' : '';
  const { data } = await getHttpClient().get(`${getConfig().LMS_BASE_URL}/api/user/v1/accounts/${username}${query}`);

  // Process response data
  return processAccountData(data);
}

// GET PREFERENCES
export async function getPreferences(username) {
  const { data } = await getHttpClient().get(`${getConfig().LMS_BASE_URL}/api/user/v1/preferences/${username}`);

  return camelCaseObject(data);
}

// GET COURSE CERTIFICATES

function transformCertificateData(data) {
  const transformedData = [];
  data.forEach((cert) => {
    // download_url may be full url or absolute path.
    // note: using the URL() api breaks in ie 11
    const urlIsPath = typeof cert.download_url === 'string'
      && cert.download_url.search(/http[s]?:\/\//) !== 0;

    const downloadUrl = urlIsPath
      ? `${getConfig().LMS_BASE_URL}${cert.download_url}`
      : cert.download_url;

    transformedData.push({
      ...camelCaseObject(cert),
      certificateType: cert.certificate_type,
      downloadUrl,
    });
  });
  return transformedData;
}

export async function getCourseCertificates(username) {
  const url = `${getConfig().LMS_BASE_URL}/api/certificates/v0/certificates/${username}/`;
  try {
    const { data } = await getHttpClient().get(url);
    return transformCertificateData(data);
  } catch (e) {
    logError(e);
    return [];
  }
}
