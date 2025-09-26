// Basic environment variable validation
// Throws on critical missing values; logs warnings for optional ones

export function validateEnv() {
  const missing = [];

  // Required in all environments
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

  // Recommended defaults
  if (!process.env.PORT) process.env.PORT = '5000';
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

  // Database is required in production
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    missing.push('MONGODB_URI');
  }

  if (missing.length) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[ENV] ${msg}`);
    }
  }

  // Soft checks / warnings
  const warnings = [];
  if (!process.env.FRONTEND_URL) warnings.push('FRONTEND_URL not set (CORS may default to localhost only).');
  if (!process.env.MIXTRAL_API_KEY) warnings.push('No Mixtral API key provided; backend will use mock AI responses.');
  if (process.env.MAX_FILE_SIZE && Number.isNaN(Number(process.env.MAX_FILE_SIZE))) warnings.push('MAX_FILE_SIZE is not a valid number; defaulting to 10MB.');
  if (warnings.length) console.warn('⚠️  Env validation warnings:\n - ' + warnings.join('\n - '));
}

export default validateEnv;
