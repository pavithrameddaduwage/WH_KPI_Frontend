const backendPort = 4012;
const backendBaseUrl = `http://localhost:${backendPort}`;
// const backendBaseUrl='https://hbs.hgusa.com/api/wh-report';
// const productionUrl = 'https://hbs.hgusa.com/wh-report/upload';

export const environment = {

  production: false,
  backendBaseUrl,

  uploadApiUrl: `${backendBaseUrl}/upload`,
  authApiUrl: `${backendBaseUrl}/auth/login`,
};
