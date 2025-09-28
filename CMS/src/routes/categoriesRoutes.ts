import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoriesController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Categories management
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories, authenticated users access
 *     description: Get a list of all categories with optional filters
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by category name (partial match, case-insensitive)
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: Filter by category slug (partial match, case-insensitive)
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   programs:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         slug:
 *                           type: string
 *                         title:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [public, draft, archived]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", requireAuth, listCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID, authenticated users access
 *     description: Get a specific category by its ID with associated programs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 programs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [public, draft, archived]
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", requireAuth, getCategory);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new , authecated usuers access
 *     description: Create a new category. Requires editor or admin role.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               slug:
 *                 type: string
 *                 description: Unique slug for the category
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 programs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [public, draft, archived]
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Editor or admin role required
 *       409:
 *         description: Category with this slug already exists
 *       500:
 *         description: Internal server error
 */
router.post("/", requireAuth, createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update a category, authenticated users access
 *     description: Update an existing category. Requires editor or admin role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               slug:
 *                 type: string
 *                 description: Unique slug for the category
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 programs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [public, draft, archived]
 *       400:
 *         description: Invalid payload or ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Editor or admin role required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category with this slug already exists
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", requireAuth, updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category, authenticated users access
 *     description: Delete a category. Requires editor or admin role. Cannot delete categories with associated programs.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid ID format or category has associated programs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 programsCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Editor or admin role required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", requireAuth, deleteCategory);

export default router;
