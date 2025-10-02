import { Router } from "express";
import { getProgramById } from "../controllers/programsController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Programs
 *   description: Program management
 */

/**
 * @swagger
 * /api/programs/{id}:
 *   get:
 *     tags: [Programs]
 *     summary: Get program by ID
 *     description: Get a specific program by its ID
 */
router.get("/programs/:id", getProgramById);

export default router;
