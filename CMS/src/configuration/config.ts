import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  port: parseInt(process.env["PORT"] || "3000", 10),
  nodeEnv: "development",

  // Database Configuration
  database: {
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432", 10),
    name: process.env["DB_NAME"] || "postgres",
    user: process.env["DB_USER"] || "postgres",
    password: process.env["DB_PASSWORD"] || "",
    ssl: process.env["DB_SSL"] === "true",
  },

  // JWT Configuration (to be added when authentication is implemented)
  jwt: {
    secret: process.env["JWT_SECRET"] || "your_jwt_secret_key",
    expiresIn: process.env["JWT_EXPIRES_IN"] || "24h",
    refreshExpiresIn: process.env["REFRESH_TOKEN_EXPIRES_IN"] || "7d",
  },
};

export default config;
