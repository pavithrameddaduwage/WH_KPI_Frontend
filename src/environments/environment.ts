const backendPort = 4005;
const backendBaseUrl = `http://localhost:${backendPort}`;
// const productionUrl = 'https://hbs.hgusa.com/wh-report/upload';

export const environment = {

  production: false,
  backendBaseUrl,

  uploadApiUrl: `${backendBaseUrl}/upload`,
  authApiUrl: `${backendBaseUrl}/auth/login`,
};
