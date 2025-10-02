import { Router } from "express";
import { search, suggest } from "../controllers/searchController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search management
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags: [Search]
 *     summary: Search programs
 *     description: Search for programs by keyword, category, language, and sort order
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Keyword to search in title and description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, oldest, title_asc, title_desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Page size (default 10, max 100)
 *     responses:
 *       200:
 *         description: Paginated search results
 */

/**
 * @swagger
 * /api/suggest:
 *   get:
 *     tags: [Search]
 *     summary: Suggest programs
 *     description: Suggest programs by keyword
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Partial keyword to get title suggestions
 *     responses:
 *       200:
 *         description: Suggestions list
 */
router.get("/search", search);

router.get("/suggest", suggest);

export default router;
