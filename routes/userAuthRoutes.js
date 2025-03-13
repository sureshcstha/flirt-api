const express = require("express");
const { signup, verify, login, changePassword, forgotPassword, resetPassword, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.get('/verify/:token', verify);
router.post("/login", login);
router.put("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete("/delete", deleteUser);

module.exports = router;