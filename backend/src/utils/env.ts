import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const env = {
  PORT: process.env.PORT || 8001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  DIGITAL_OCEAN_BUCKET_ORIGIN_ENDPOINT: process.env.DIGITAL_OCEAN_BUCKET_ORIGIN_ENDPOINT || '',
  DIGITAL_OCEAN_BUCKET_CDN_ENDPOINT: process.env.DIGITAL_OCEAN_BUCKET_CDN_ENDPOINT || '',
  DIGITAL_OCEAN_KEY_ID: process.env.DIGITAL_OCEAN_KEY_ID || '',
  DIGITAL_OCEAN_SECRET_ACCESS_KEY: process.env.DIGITAL_OCEAN_SECRET_ACCESS_KEY || '',
  DIGITAL_OCEAN_BUCKET_NAME: process.env.DIGITAL_OCEAN_BUCKET_NAME || '',
  LOG_LEVEL: process.env.LOG_LEVEL || '',
  PI_API_KEY: process.env.PI_API_KEY || '',
  PLATFORM_API_URL: process.env.PLATFORM_API_URL || '',
  UPLOAD_PATH: process.env.UPLOAD_PATH || '',
  MONGODB_URI_PREFIX: process.env.MONGODB_URI_PREFIX || '',
  MONGODB_APP_USER: process.env.MONGODB_APP_USER || '',
  MONGODB_APP_PASSWORD: process.env.MONGODB_APP_PASSWORD || '',
  MONGODB_HOST: process.env.MONGODB_HOST || '',
  MONGODB_APP_DATABASE_NAME: process.env.MONGODB_APP_DATABASE_NAME || '',
  MONGODB_OPTION_PARAMS: process.env.MONGODB_OPTION_PARAMS || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  DEVELOPMENT_URL: process.env.DEVELOPMENT_URL || '',
  PRODUCTION_URL: process.env.PRODUCTION_URL || '',
  CORS_ORIGIN_URL: process.env.CORS_ORIGIN_URL || ''
};