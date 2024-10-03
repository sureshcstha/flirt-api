const express = require("express");
const router = express.Router();

const {
  getMessage,
  getAllCategories,
  createMessage,
  updateMessage,
  deleteMessage,
  getAllMessagesTesting,
} = require("../controllers/messageController");

router.route("/").get(getMessage); // Get all messages
router.route("/categories").get(getAllCategories); // Get all categories

router.route("/message").post(createMessage); // Create a new message
router.route("/message/:id").put(updateMessage); // Update a message by ID
router.route("/message/:id").delete(deleteMessage); // Delete a message by ID

router.route("/testing").get(getAllMessagesTesting);

module.exports = router;

/*

    http://localhost:5000/api/messages
    
    http://localhost:5000/api/messages?random=true

    http://localhost:5000/api/messages/categories

    http://localhost:5000/api/messages?featured=true

    http://localhost:5000/api/messages?category={category}

    http://localhost:5000/api/messages?category=cute&featured=false

    http://localhost:5000/api/messages?sort=-category

    http://localhost:5000/api/messages?sort=-featured

    http://localhost:5000/api/messages?sort=category,message

    http://localhost:5000/api/messages?sort=-category,-message

    http://localhost:5000/api/messages?sort=category&select=message,category

    http://localhost:5000/api/messages?select=message

    http://localhost:5000/api/messages/testing


    create, update delete
    
    http://localhost:5000/api/messages/message

    http://localhost:5000/api/messages/message/1234567890abcdef12345678

    http://localhost:5000/api/messages/message/1234567890abcdef12345678

*/
