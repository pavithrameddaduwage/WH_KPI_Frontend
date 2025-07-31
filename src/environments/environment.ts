const backendPort = 4005;
const backendBaseUrl = `http://localhost:${backendPort}`;
// const productionUrl = '';

export const environment = {

  production: false,
  backendBaseUrl,

  uploadApiUrl: `${backendBaseUrl}/upload`,
  authApiUrl: `${backendBaseUrl}/auth/login`,
};
