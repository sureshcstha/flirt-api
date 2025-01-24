/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Retrieve love messages.
 *     description: Get all love messages or a random love message by specifying query parameters. You can filter messages by category or featured status, or retrieve a random message using the `random=true` query parameter.
 *     parameters:
 *       - name: category
 *         in: query
 *         description: Filter messages by category.
 *         required: false
 *         schema:
 *           type: string
 *       - name: featured
 *         in: query
 *         description: Filter messages by featured status.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - name: random
 *         in: query
 *         description: Retrieve a random love message. Set to `true` to enable.
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: Successfully retrieved love messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 statusText:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Love messages retrieved successfully
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 1234567890abcdef12345678
 *                           message:
 *                             type: string
 *                             example: "You are the light of my life."
 *                           category:
 *                             type: string
 *                             example: Romance
 *                     - type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 1234567890abcdef12345678
 *                         message:
 *                           type: string
 *                           example: "You are my one and only."
 *                         category:
 *                           type: string
 *                           example: Love
 *       400:
 *         description: Invalid request, such as malformed query parameters.
 *       500:
 *         description: Server error.
 */



/**
 * @swagger
 * /api/messages/categories:
 *   get:
 *     summary: Retrieve all unique message categories
 *     description: Fetches all unique categories available in the 'category' field of the Message collection.
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: A list of all unique categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 statusText:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: All categories retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 
 *                     - anniversary
 *                     - birthday
 *                     - love
 *                     - friendship
 *                     - congratulations
 *                     - motivation
 *                     - romantic
 *                     - sympathy
 *       500:
 *         description: Error occurred while retrieving categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 statusText:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Error retrieving categories
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

/**
 * @swagger
 * /api/messages/message/{id}:
 *   get:
 *     summary: Retrieve a message by ID
 *     description: Fetches a message from the database by its unique ID.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the message.
 *         schema:
 *           type: string
 *           example: 67898ad46f88f1dfaf5de11f
 *     responses:
 *       200:
 *         description: The message was retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 statusText:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Message retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67898ad46f88f1dfaf5de11f
 *                     category:
 *                       type: string
 *                       example: anniversary
 *                     message:
 *                       type: string
 *                       example: "Happy anniversary to the best couple ever!"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-24T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-24T10:00:00Z"
 *       400:
 *         description: Invalid message ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 statusText:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: Invalid message ID format
 *       404:
 *         description: Message not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 statusText:
 *                   type: string
 *                   example: Not Found
 *                 message:
 *                   type: string
 *                   example: Message not found
 *       500:
 *         description: Error occurred while retrieving the message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 statusText:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Error retrieving message
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

/**
 * @swagger
 * /api/messages/message:
 *   post:
 *     summary: Create a new love message
 *     description: Adds a new love message to the database. The `category` field is required to categorize the message.
 *     tags:
 *       - Messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - message
 *             properties:
 *               category:
 *                 type: string
 *                 description: The category of the message.
 *                 example: cute
 *               message:
 *                 type: string
 *                 description: The content of the love message.
 *                 example: "You are the cutest thing in my life!"
 *     responses:
 *       201:
 *         description: The love message was created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 statusText:
 *                   type: string
 *                   example: Created
 *                 message:
 *                   type: string
 *                   example: Love message created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 1234567890abcdef12345678
 *                     category:
 *                       type: string
 *                       example: cute
 *                     content:
 *                       type: string
 *                       example: "You are the cutest thing in my life!"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-24T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-24T10:00:00Z"
 *       400:
 *         description: Bad request. Validation failed for required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 statusText:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: Error creating love message
 *                 error:
 *                   type: string
 *                   example: "Validation failed: category is required"
 */

/**
 * @swagger
 * /api/messages/message/{id}:
 *   put:
 *     summary: Update an existing love message by ID
 *     description: Updates the details of an existing love message. The message is identified by its unique ID.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the love message to update.
 *         schema:
 *           type: string
 *           example: 67898ad46f88f1dfaf5de11f
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: The updated category of the love message.
 *                 example: cute
 *               message:
 *                 type: string
 *                 description: The updated content of the love message.
 *                 example: "You are the light of my life!"
 *     responses:
 *       200:
 *         description: The love message was updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 statusText:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Love message updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67898ad46f88f1dfaf5de11f
 *                     category:
 *                       type: string
 *                       example: cute
 *                     message:
 *                       type: string
 *                       example: "You are the light of my life!"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-24T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-24T10:30:00Z"
 *       400:
 *         description: Invalid request. Possible reasons include invalid ID format or validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 statusText:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: Error updating love message
 *                 error:
 *                   type: string
 *                   example: "Invalid message ID format"
 *       404:
 *         description: The specified love message was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 statusText:
 *                   type: string
 *                   example: Not Found
 *                 message:
 *                   type: string
 *                   example: Love message not found
 */

/**
 * @swagger
 * /api/messages/message/{id}:
 *   delete:
 *     summary: Delete a love message by ID
 *     description: Deletes a love message identified by its unique ID from the database.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the love message to delete.
 *         schema:
 *           type: string
 *           example: 67898ad46f88f1dfaf5de11f
 *     responses:
 *       200:
 *         description: The love message was deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 statusText:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Love message deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67898ad46f88f1dfaf5de11f
 *                     category:
 *                       type: string
 *                       example: cute
 *                     message:
 *                       type: string
 *                       example: "You are the light of my life!"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-24T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-24T10:30:00Z"
 *       400:
 *         description: Invalid request due to an incorrect ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 statusText:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: Invalid message ID format
 *       404:
 *         description: The specified love message was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 statusText:
 *                   type: string
 *                   example: Not Found
 *                 message:
 *                   type: string
 *                   example: Love message not found
 *       500:
 *         description: Server error occurred while attempting to delete the message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 statusText:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Error deleting love message
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */