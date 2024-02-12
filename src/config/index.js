const isEdaoEvent =
  process.env.REACT_APP_EVENT_ID === '1baa5666-1a51-11ed-b640-02d5459a7dbb';

export default {
  isEdaoEvent,
  isSinglePlayer: isEdaoEvent,
  agora: {
    appId: process.env.REACT_APP_AGORA_APP_ID || '',
  },
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
  },
  api: {
    cms: process.env.REACT_APP_CMS_URL,
    dev_cms: process.env.REACT_APP_CMS_URL_DEV,
    loadBalancer: process.env.REACT_APP_LOADBALANCER_URL,
    twilioLambda: process.env.REACT_APP_LAMBDA_TWILIO_URL,
    eventLogger: 'https://eventlogger.surrealevents.com',
    xpManager: process.env.REACT_APP_XP_MANAGER_URL + '/api',
    xpManagerBaseURL: process.env.REACT_APP_XP_MANAGER_URL
  },
  developer: {
    is_developer: process.env.REACT_APP_IS_DEVELOPER === 'true',
    enable_developer_mode: process.env.REACT_APP_DEVELOPERMODE === 'true',
  },
  keycloak : {
    url: process.env.REACT_APP_KEYCLOAK_URL,
    realm: process.env.REACT_APP_KEYCLOAK_REALM,
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID
  },
  crypto: {
    algorithm: process.env.REACT_APP_CRYPTO_ALGORITHM || 'aes-256-ctr',
    secretKey: process.env.REACT_APP_CRYPTO_SECRET_KEY || 'secret',
  },
  collections: {
    address: {
      mempoNft: process.env.REACT_APP_MEMPO_CONTRACT_ADDRESS,
    },
  },
  env: process.env.NODE_ENV,
  event: {
    id: process.env.REACT_APP_EVENT_ID || '',
    title: process.env.REACT_APP_EVENT_TITLE || '',
    name: process.env.REACT_APP_EVENT_NAME || '',
  },
  experience: {
    subExperienceId: process.env.REACT_APP_SUB_EXPERIENCE_ID || '',
    mainExperienceId: process.env.REACT_APP_MAIN_EXPERIENCE_ID || ''
  },
  jwt: {
    token: process.env.REACT_APP_JWT_TOKEN,
  },
  timezone: process.env.REACT_APP_SERVER_TIMEZONE || 'America/New_York',
  onlineStatusUrl: process.env.REACT_APP_ONLINESTATUS_URL,
  build: process.env.REACT_APP_BUILD_VERSION,
  awsWebsocket: {
    url: process.env.REACT_APP_AWS_SOCKET,
    stage: process.env.REACT_APP_AWS_SOCKET_STAGE || 'dev',
    dev_url: process.env.REACT_APP_DEV_AWS_SOCKET,
    dev_stage: process.env.REACT_APP_DEV_AWS_SOCKET_STAGE || 'dev',
  },
  locked: process.env.REACT_APP_LOCKED
};
