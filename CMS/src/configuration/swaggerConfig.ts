import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "My API Description",
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT access token",
      },
    },
  },
  security: [{ BearerAuth: [] }],
};
const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "../routes/*.ts")], // Path to the API routes in your Node.js application
};
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
