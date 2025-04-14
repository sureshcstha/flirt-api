const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const authorize = require("../middleware/authorize");

const {
  getMessage,
  getAllCategories,
  createMessage,
  getMessageById,
  updateMessage,
  deleteMessage,
  likeMessage,
  getAllMessagesTesting,
} = require("../controllers/messageController");

router.route("/").get(getMessage); // Get all messages
router.route("/categories").get(getAllCategories); // Get all categories

router.route("/message")
  .post(authenticateUser, authorize(["contributor", "editor", "admin", "superadmin"]), createMessage); // Create a new message

router.route('/message/:id')
  .get(getMessageById) // Get a message by ID
  .put(authenticateUser, authorize(["editor", "admin", "superadmin"]), updateMessage) // Update a message
  .delete(authenticateUser, authorize(["superadmin"]), deleteMessage); // Delete a message

router.patch('/message/:id/like', authenticateUser, likeMessage); // Like/Unlike a message

router.route("/testing").get(getAllMessagesTesting);

module.exports = router;

/*

    http://localhost:5000/messages

    http://localhost:5000/messages?page=2&limit=30
    
    http://localhost:5000/messages?random=true

    http://localhost:5000/messages/categories

    http://localhost:5000/messages?featured=true

    http://localhost:5000/messages?category={category}

    http://localhost:5000/messages?status={status}

    http://localhost:5000/messages?category=heartfelt&status=draft

    http://localhost:5000/messages?category=cute&featured=false

    http://localhost:5000/messages?sort=-category

    http://localhost:5000/messages?sort=-featured

    http://localhost:5000/messages?sort=category,message

    http://localhost:5000/messages?sort=-category,-message

    http://localhost:5000/messages?sort=category&select=message,category

    http://localhost:5000/messages?select=message

    http://localhost:5000/messages/testing


    create, update delete
    
    http://localhost:5000/messages/message

    http://localhost:5000/messages/message/1234567890abcdef12345678

    http://localhost:5000/messages/message/1234567890abcdef12345678

*/
