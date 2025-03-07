const ApiUser = require("../models/ApiUser");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Generate a unique clientId
const generateUniqueClientId = async () => {
    let clientId, existingUser;
    do {
        clientId = crypto.randomBytes(16).toString("hex");
        existingUser = await ApiUser.findOne({ clientId });
    } while (existingUser);
    return clientId;
};

// Generate a random clientSecret
const generateClientSecret = async () => {
    return crypto.randomBytes(32).toString("hex");
};


// API User Signup
exports.signup = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        let user = await ApiUser.findOne({ email });

        if (user) {
        return res.status(400).json({ error: "Email already registered" });
        }

        const clientId = await generateUniqueClientId();
        const clientSecret = await generateClientSecret();
        
        user = new ApiUser({ email, password, clientId, clientSecret });
        await user.save();

      // Respond with clientId and clientSecret
      res.status(201).json({
        message: "Signup successful. Please log in.",
        clientId,
        clientSecret,
      });
    } catch (error) {
        console.error("Signup error:", error)
        res.status(500).json({ error: error.message });
    }
};


// Change Password
exports.changePassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ error: "Email, current password, and new password are required" });
    }

    try {
        const user = await ApiUser.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if current password is correct
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid current password" });
        }

        // Check if new password is the same as the old password
        const isReusedPassword  = await user.isSamePassword(newPassword);
        if (isReusedPassword ) {
            return res.status(400).json({ error: "New password cannot be the same as the old password." });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Allow users to regenerate their API key if needed.
exports.regenerateClientSecret = async (req, res) => {
    const { clientId, password } = req.body;

    if (!clientId) {
        return res.status(400).json({ error: "Client ID is required" });
    }
    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    try {
        const user = await ApiUser.findOne({ clientId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a new Client Secret
        const newClientSecret = await generateClientSecret();
        user.clientSecret = newClientSecret;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            message: "Client secret regenerated successfully.",
            clientSecret: newClientSecret
        });
    } catch (error) {
        console.error("Error regenerating client secret:", error);
        res.status(500).json({ error: error.message });
    }
};


// Authenticate user using clientId and clientSecret and then generates a JWT token
exports.accessToken = async (req, res) => {
    const { clientId, clientSecret } = req.body;

    try {
        // Find developer by clientId
        const user = await ApiUser.findOne({ clientId });

        if (!user) {
            return res.status(401).json({ error: "Invalid clientId" });
        }
        if (user.clientSecret !== clientSecret) {
            return res.status(401).json({ error: "Invalid clientSecret" });
        }

        const expiresIn = process.env.JWT_EXPIRATION || "1800";
        const issuedAt = Date.now().toString();
        const accessToken = jwt.sign({ clientId }, process.env.JWT_SECRET, {
            expiresIn,
        });

        const response = {
            refresh_token_expires_in: "0",
            developer_email: user.email,
            token_type: "Bearer",
            issued_at: issuedAt,
            client_id: clientId,
            access_token: accessToken,
            expires_in: expiresIn,
            refresh_count: "0"
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}



// Delete User Account
exports.deleteApiUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
  
    try {
        const user = await ApiUser.findOne({ email });
  
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
  
        // Check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
  
        await ApiUser.deleteOne({ email });
  
        res.json({ message: "API user deleted successfully" });
    } catch (error) {
        console.error("Delete API user error:", error);
        res.status(500).json({ error: error.message });
    }
};
