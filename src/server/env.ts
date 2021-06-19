import dotenv from 'dotenv';

// for production we use docker-compose to load the .env.prod into our container
// so it will override what is picked up here.
// if this wasn't true then we would need to specify the path option.
dotenv.config();

export const env = {
  googleClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  secret: process.env.AUTH_SECRET || 'dev-only-secret',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV,
  apiUrl: process.env.API_URL || 'listifi.app',
  sendGridApiKey: process.env.SENDGRID_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
};

export const COOKIE_TOKEN = 'token';
export const jwtOptions = {
  secret: env.secret,
  cookie: COOKIE_TOKEN,
  debug: env.nodeEnv === 'development',
};
