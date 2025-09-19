import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './configuration/swaggerConfig';
import config from './configuration/config';

// Import routes
import exampleRoutes from './routes/exampleRoutes';

// Import middleware (to be created)
// import { errorHandler } from '@/middleware/errorHandler';
// import { notFound } from '@/middleware/notFound';

// Create Express app
const app: Application = express();

// Initialize middlewares
  // Security middleware
  app.use(helmet());
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// 
  // Logging middleware
  app.use(morgan('combined'));
  
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
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv
    });
  });

  // API routes
//   app.use('/api', (req: Request, _res: Response, next: NextFunction) => {
//     // API versioning middleware
//     req.apiVersion = 'v1';
//     next();
//   });

  // Use example routes
  app.use('/api', exampleRoutes);

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
   *                   example: /swagger
   */
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Welcome to CMS API',
      version: '1.0.0',
      documentation: '/swagger'
    });
  });


// Initialize Swagger
//   Swagger documentation route
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'CMS API Documentation'
  }));  

  // Also serve Swagger UI at the root swagger path
  app.get('/swagger/', (_req: Request, res: Response) => {
    res.redirect('/swagger');
  });

  app.get('/swagger.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

// Initialize error handling
  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      error: 'Route not found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString()
    });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: config.nodeEnv === 'production' 
        ? 'Something went wrong' 
        : err.message,
      timestamp: new Date().toISOString()
    });
  });




// Start server

  const port = config.port;
  
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}/swagger`);
    console.log(`🏥 Health check available at http://localhost:${port}/health`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });




export default app;
