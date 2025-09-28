import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  listPrograms,
  getProgram,
  createProgram,
  updateProgram,
  publishProgram,
  archiveProgram,
} from "../controllers/programsController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Programs
 *   description: Programs management
 */

/**
 * @swagger
 * /api/programs:
 *   get:
 *     tags: [Programs]
 *     summary: List all programs
 *     description: Get a list of all programs with their details and optional filters
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by program title (partial match, case-insensitive)
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: Filter by program slug (partial match, case-insensitive)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [public, draft, archived]
 *         description: Filter by program status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug (partial match, case-insensitive)
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by program language (partial match, case-insensitive)
 *       - in: query
 *         name: publicationDateStart
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by publication date (from this date)
 *       - in: query
 *         name: publicationDateEnd
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by publication date (to this date)
 *     responses:
 *       200:
 *         description: List of programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   slug:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [public, draft, archived]
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   categoryId:
 *                     type: integer
 *                   category:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                   publicationDate:
 *                     type: string
 *                     format: date-time
 *                   language:
 *                     type: string
 *                   durationSeconds:
 *                     type: integer
 *                   published:
 *                     type: object
 *                     nullable: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", requireAuth, listPrograms);

/**
 * @swagger
 * /api/programs/{id}:
 *   get:
 *     tags: [Programs]
 *     summary: Get program by ID
 *     description: Get a specific program by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     responses:
 *       200:
 *         description: Program details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 slug:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [public, draft, archived]
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: integer
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                 publicationDate:
 *                   type: string
 *                   format: date-time
 *                 language:
 *                   type: string
 *                 durationSeconds:
 *                   type: integer
 *                 published:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Program not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", requireAuth, getProgram);

/**
 * @swagger
 * /api/programs:
 *   post:
 *     tags: [Programs]
 *     summary: Create a new program
 *     description: Create a new program. Requires editor or admin role.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slug, title]
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Unique slug for the program
 *               title:
 *                 type: string
 *                 description: Program title
 *               description:
 *                 type: string
 *                 description: Program description
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *               language:
 *                 type: string
 *                 description: Program language
 *               durationSeconds:
 *                 type: integer
 *                 description: Program duration in
 *               publicationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Program publication date
 *     responses:
 *       201:
 *         description: Program created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 slug:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [public, draft, archived]
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: integer
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                 publicationDate:
 *                   type: string
 *                   format: date-time
 *                 language:
 *                   type: string
 *                 durationSeconds:
 *                   type: integer
 *                 published:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Invalid payload or category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Editor or admin role required
 *       409:
 *         description: Program with this slug already exists
 *       500:
 *         description: Internal server error
 */
router.post("/", requireAuth, createProgram);

/**
 * @swagger
 * /api/programs/{id}:
 *   patch:
 *     tags: [Programs]
 *     summary: Update a program
 *     description: Update an existing program. Requires editor or admin role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Unique slug for the program
 *               title:
 *                 type: string
 *                 description: Program title
 *               description:
 *                 type: string
 *                 description: Program description
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *               language:
 *                 type: string
 *                 description: Program language
 *               durationSeconds:
 *                 type: integer
 *                 description: Program duration in
 *               publicationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Program publication date
 *     responses:
 *       200:
 *         description: Program updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 slug:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [public, draft, archived]
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: integer
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                 publicationDate:
 *                   type: string
 *                   format: date-time
 *                 language:
 *                   type: string
 *                 durationSeconds:
 *                   type: integer
 *                 published:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Invalid payload, ID format, or category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Editor or admin role required
 *       404:
 *         description: Program not found
 *       409:
 *         description: Program with this slug already exists
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", requireAuth, updateProgram);

/**
 * @swagger
 * /api/programs/{id}/publish:
 *   post:
 *     tags: [Programs]
 *     summary: Publish a program
 *     description: Publish a program, making it publicly available. Requires editor or admin role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     responses:
 *       200:
 *         description: Program published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 slug:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [public, draft, archived]
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: integer
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                 publicationDate:
 *                   type: string
 *                   format: date-time
 *                 language:
 *                   type: string
 *                 durationSeconds:
 *                   type: integer
 *                 published:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Invalid ID format or program already published
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Editor or admin role required
 *       404:
 *         description: Program not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/publish", requireAuth, publishProgram);

/**
 * @swagger
 * /api/programs/{id}/archive:
 *   post:
 *     tags: [Programs]
 *     summary: Archive a program
 *     description: Archive a program, removing it from public view. Requires editor or admin role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     responses:
 *       200:
 *         description: Program archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 slug:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [public, draft, archived]
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: integer
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                 publicationDate:
 *                   type: string
 *                   format: date-time
 *                 language:
 *                   type: string
 *                 durationSeconds:
 *                   type: integer
 *                 published:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Invalid ID format or program already archived
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Editor or admin role required
 *       404:
 *         description: Program not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/archive", requireAuth, archiveProgram);

export default router;
