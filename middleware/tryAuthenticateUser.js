const jwt = require("jsonwebtoken");
const User = require("../models/User");

const tryAuthenticateUser = async (req, res, next) => {
    const token = req.cookies?.access_token;

    if (!token) {
        // No token = guest
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).lean();

        if (!user) {
            req.user = null;
        } else {
            req.user = user;
        }
    } catch (error) {
        req.user = null; // Invalid token = treat as guest
    }

    next();
};

module.exports = tryAuthenticateUser;

// lets guests through, but adds req.user if available → perfect for hybrid public/private behavior like my / route.
