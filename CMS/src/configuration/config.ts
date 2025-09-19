import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env['PORT'] || '3000', 10),
  nodeEnv: 'development',
  
  // Database Configuration (to be added when database is implemented)
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    name: process.env['DB_NAME'] || 'cms_db',
    user: process.env['DB_USER'] || 'cms_user',
    password: process.env['DB_PASSWORD'] || '',
  },
  
  // JWT Configuration (to be added when authentication is implemented)
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your_jwt_secret_key',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
  },
  
  // Swagger Configuration
  swagger: {
    title: process.env['SWAGGER_TITLE'] || 'CMS API',
    version: process.env['SWAGGER_VERSION'] || '1.0.0',
    description: process.env['SWAGGER_DESCRIPTION'] || 'A Content Management System API',
    contact: {
      name: process.env['SWAGGER_CONTACT_NAME'] || 'API Support',
      email: process.env['SWAGGER_CONTACT_EMAIL'] || 'support@cms.com'
    },
    license: {
      name: process.env['SWAGGER_LICENSE_NAME'] || 'MIT',
      url: process.env['SWAGGER_LICENSE_URL'] || 'https://opensource.org/licenses/MIT'
    }
  }
};

export default config;
