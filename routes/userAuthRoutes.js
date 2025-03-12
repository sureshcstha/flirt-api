const express = require("express");
const { signup, verify, login, changePassword, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/verify/:token', verify);
router.post("/login", login);
router.put("/change-password", changePassword);
router.delete("/delete", deleteUser);

module.exports = router;