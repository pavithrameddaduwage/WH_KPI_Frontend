const backendPort = 4012;
const backendBaseUrl = `http://localhost:${backendPort}`;
// const backendBaseUrl='https://hbs.hgusa.com/api/kpi-upload';


export const environment = {

  production: false,
  backendBaseUrl,

  uploadApiUrl: `${backendBaseUrl}/upload`,
  authApiUrl: `${backendBaseUrl}/auth/login`,
};
