const express = require("express");
const authenticateUser = require("../middleware/authenticateUser");
const requireAdmin = require("../middleware/requireAdmin");
const { signup, resendVerification, verify, login, refreshToken, changePassword, 
    forgotPassword, resetPassword, logout, deleteUser, getAllUsers, updateUserRole } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/resend-verification', resendVerification);
router.get('/verify/:token', verify);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.put("/change-password", authenticateUser, changePassword);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", resetPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", authenticateUser, logout);
router.delete("/delete", authenticateUser, deleteUser);

router.get("/", authenticateUser, requireAdmin, getAllUsers);
router.put("/role/:id", authenticateUser, requireAdmin, updateUserRole);

module.exports = router;