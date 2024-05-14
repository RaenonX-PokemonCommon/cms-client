export const STORAGE_KEY = 'strapi.auth.token';

const authUrl = {
  signIn: '/auth/local',
  signUp: '/auth/local/register',
  getMe: '/users/me',
};

export const endPoints = {
  auth: authUrl,
};
