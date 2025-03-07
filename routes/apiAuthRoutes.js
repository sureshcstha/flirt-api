const express = require("express");
const { signup, changePassword, regenerateClientSecret, accessToken, deleteApiUser } = require('../controllers/apiUserController');

const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();


router.post('/signup', signup);
router.put("/change-password", changePassword);
router.put("/regenerate-client-secret", regenerateClientSecret);
router.post('/accesstoken', accessToken);
router.delete("/delete", deleteApiUser);

module.exports = router;
