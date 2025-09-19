import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Example API endpoint
 *     description: A simple example endpoint to demonstrate API documentation
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Example response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is an example endpoint
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 */
router.get('/example', (_req: Request, res: Response) => {
  res.json({
    message: 'This is an example endpoint',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/example/{id}:
 *   get:
 *     summary: Get example by ID
 *     description: Retrieve an example item by its ID
 *     tags: [Example]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The example ID
 *     responses:
 *       200:
 *         description: Example item found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123"
 *                 name:
 *                   type: string
 *                   example: "Example Item"
 *                 description:
 *                   type: string
 *                   example: "This is an example item"
 *       404:
 *         description: Example item not found
 */
router.get('/example/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  // This is just an example - in a real app you'd fetch from database
  if (id === '123') {
    res.json({
      id: id,
      name: 'Example Item',
      description: 'This is an example item'
    });
  } else {
    res.status(404).json({
      error: 'Item not found',
      message: `No item found with ID: ${id}`
    });
  }
});

export default router;
