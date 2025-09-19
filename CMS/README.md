# CMS (Content Management System)

A modern Content Management System API built with Node.js, Express, and TypeScript.

## Features

- 🚀 **Express.js** with TypeScript
- 📚 **Swagger/OpenAPI** documentation
- 🔒 **Security** with Helmet and CORS
- 📝 **Logging** with Morgan
- 🏥 **Health check** endpoint
- 🎯 **API versioning** support
- ⚙️ **Environment-based** configuration

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd CMS
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
# Create .env file manually or copy from ENVIRONMENT_SETUP.md
```

4. Update the `.env` file with your configuration (see `ENVIRONMENT_SETUP.md` for complete list):

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Swagger Configuration
SWAGGER_TITLE=CMS API
SWAGGER_VERSION=1.0.0
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## Development

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs.json`
- **Health Check**: `http://localhost:3000/health`
- **API Root**: `http://localhost:3000/`

## Project Structure

```
src/
├── app.ts                 # Main application entry point
├── configuration/
│   ├── config.ts         # Environment configuration
│   └── swaggerConfig.ts  # Swagger documentation configuration
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
├── routes/              # API routes
├── types/               # TypeScript type definitions
│   └── express.d.ts     # Express type extensions
└── utils/               # Utility functions
```

## API Endpoints

### Health Check

- `GET /health` - Server health status

### API Documentation

- `GET /api-docs` - Swagger UI documentation
- `GET /api-docs.json` - OpenAPI specification

### Root

- `GET /` - API welcome message

## Configuration

The application uses a centralized configuration system in `src/configuration/config.ts`. Key configuration options include:

- **Server**: Port, environment
- **CORS**: Allowed origins
- **Database**: Connection settings (to be implemented)
- **JWT**: Authentication settings (to be implemented)
- **File Upload**: Upload settings (to be implemented)
- **Swagger**: API documentation settings

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Request validation** (to be implemented)
- **Rate limiting** (to be implemented)
- **Authentication** (to be implemented)

## Development Guidelines

1. **TypeScript**: All code should be written in TypeScript
2. **ESLint**: Follow the project's linting rules
3. **API Documentation**: Document all endpoints with Swagger annotations
4. **Error Handling**: Use proper error handling middleware
5. **Environment Variables**: Use the config system for all environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
