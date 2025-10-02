import express, { Application, NextFunction, Request, Response } from "express";

import swaggerSpec from "./configuration/swaggerConfig";
import swaggerUI from "swagger-ui-express";
import config from "./configuration/config";
import searchRoutes from "./routes/searchRoutes";
import programsRoutes from "./routes/programsRoutes";
import cors from "cors";

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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", searchRoutes);
app.use("/api", programsRoutes);

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
 */
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to Discovery API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

app.get("/swagger/", (_req: Request, res: Response) => {
  res.redirect("/api-docs");
});

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search programs
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Keyword query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, oldest, title_asc, title_desc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated search results
 */

/**
 * @swagger
 * /suggest:
 *   get:
 *     summary: Title autocomplete suggestions
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suggestions list
 */

/**
 * @swagger
 * /programs/{id}:
 *   get:
 *     summary: Get program by id
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program details
 *       404:
 *         description: Not found
 */

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      config.nodeEnv === "production" ? "Something went wrong" : err.message,
    timestamp: new Date().toISOString(),
  });
});

const port = config.port;

app.listen(port, async () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api-docs`
  );
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

export default app;
