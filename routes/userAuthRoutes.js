const express = require("express");
const authenticateUser = require("../middleware/authenticateUser");
const { signup, verify, login, refreshToken, changePassword, forgotPassword, resetPassword, logout, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.get('/verify/:token', verify);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.put("/change-password", authenticateUser, changePassword);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", resetPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", authenticateUser, logout);
router.delete("/delete", authenticateUser, deleteUser);

module.exports = router;