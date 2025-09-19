# Thamaniyah Assignment

This project contains two main components:

## 📁 Project Structure

```
Thamaniyah Assignment/
├── CMS/                    # Content Management System API
│   ├── src/
│   │   ├── configuration/  # Swagger configuration
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   └── app.ts         # Main application
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   └── README.md
├── Discovery/              # Discovery service (to be implemented)
└── README.md              # This file
```

## 🚀 CMS (Content Management System)

A robust API built with:

- **Express.js** with TypeScript
- **Swagger/OpenAPI** documentation
- **Health check** endpoints
- **Security** middleware (Helmet, CORS)
- **Request logging** with Morgan

### Quick Start

1. Navigate to the CMS directory:

```bash
cd CMS
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. Access the API:
   - API: http://localhost:3000
   - Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

## 🔍 Discovery (Coming Soon)

The Discovery service will be implemented here.

## 📋 Requirements

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Development

Each component has its own package.json and can be developed independently. See individual README files in each directory for specific instructions.
