import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";

import swaggerSpec from "./configuration/swaggerConfig";
import swaggerUI from "swagger-ui-express";
import config from "./configuration/config";

// Import routes
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";
import programsRoutes from "./routes/programsRoutes";
import categoriesRoutes from "./routes/categoriesRoutes";
import { seedInitialUser } from "./utils/seed";

// Create Express app
const app: Application = express();

// CORS middleware
app.use(
  cors({
    origin: process.env["ALLOWED_ORIGINS"]?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

// // Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Logging middleware
app.use(morgan("combined"));

// Use example routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/programs", programsRoutes);
app.use("/api/categories", categoriesRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 123.456
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get("/health", async (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     description: Returns welcome message and API information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to CMS API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 */
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to CMS API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// Initialize Swagger
//   Swagger documentation route
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
//   explorer: true,
//   customSiteTitle: 'CMS API Documentation'
// }));
app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
  })
);

// // Also serve Swagger UI at the root swagger path
app.get("/swagger/", (_req: Request, res: Response) => {
  res.redirect("/api-docs");
});

// Initialize error handling
// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);

  res.status(500).json({
    error: "Internal Server Error",
    message:
      config.nodeEnv === "production" ? "Something went wrong" : err.message,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const port = config.port;

app.listen(port, async () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api-docs`
  );
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  try {
    await seedInitialUser();
    console.log("🌱 Seed: ensured test user exists");
  } catch (err) {
    console.error("Seed error", err);
  }
});

export default app;
