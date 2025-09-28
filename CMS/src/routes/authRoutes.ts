import { Router } from "express";
import { login, logout, refreshToken } from "../controllers/authController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and token management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive access and refresh tokens
 *     description: Authenticate user and receive access and refresh tokens. No authentication required.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Tokens issued
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke the current session
 *     description: Revoke the current user session. Accepts either access token or refresh token.
 *     security: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: Bearer access token
 *       - in: header
 *         name: x-refresh-token
 *         schema:
 *           type: string
 *         required: false
 *         description: Refresh token to revoke if no access token provided
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/refreshToken:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh token and get a new access token
 *     description: Exchange a valid refresh token for new access and refresh tokens. No authentication required.
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     parameters:
 *       - in: header
 *         name: x-refresh-token
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: New tokens issued
 *       400:
 *         description: Missing refresh token
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refreshToken", refreshToken);

export default router;
