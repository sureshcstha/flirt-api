const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, resetPasswordEmail } = require("../services/emailService");
const { sanitizeInput } = require('../utils/helpers');

const REDIRECT_URL = process.env.USER_VERIFICATION_REDIRECT_URL || "http://localhost:3000/login";

// User Signup
exports.signup = async (req, res) => {
    let { firstName, lastName, email, password } = req.body;

    firstName = sanitizeInput(firstName);
    lastName = sanitizeInput(lastName);
    email = sanitizeInput(email);

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "First name, email and password are required." });
    }

    try {
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            return res.status(400).json({ error: "Email already registered." });
        }

        const verificationToken = crypto.randomBytes(16).toString("hex");

        user = new User({
            firstName,
            lastName: lastName || "",
            email,
            password,
            verificationToken,
            isVerified: false
        });

        await Promise.all([
            user.save(), 
            sendVerificationEmail(email, firstName, verificationToken)
        ]);

        res.status(201).json({ message: "Signup successful. Please check your email to verify your account." });
    } catch (error) {
        console.error("Signup error:", error)
        res.status(500).json({ error: error.message });
    }
};

// Verify User Email
exports.verify = async (req, res) => {
    try {
      const user = await User.findOne({ verificationToken: req.params.token });
  
      if (!user) return res.status(400).json({ message: "Invalid or expired token" });
  
      // Mark user as verified
      user.isVerified = true;
      user.verificationToken = undefined; // Remove token after verification
      await user.save();

    // Check if request is from a browser or API client
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
        // Redirect to frontend login page
        return res.redirect(`${REDIRECT_URL}?verified=true`);
    } 
  
    // Return JSON response for API requests
    res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      res.status(500).json({ message: "Error verifying email", error });
    }
};
  

// Allow users to authenticate
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email first." });  
        } 

        // Check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Define expiration time
        const expiresIn = "604800"; // 7 days

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        const response = {
            message: "Login successful.",
            email: user.email,
            token,
            expires_in: expiresIn,
            refresh_token_expires_in: "0",
            refresh_count: "0"
        };
        
        res.json(response);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
};


// Change Password
exports.changePassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ error: "Email, current password, and new password are required." });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if current password is correct
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid current password." });
        }

        // Check if new password is the same as the old password
        const isReusedPassword  = await user.isSamePassword(newPassword);
        if (isReusedPassword ) {
            return res.status(400).json({ error: "New password cannot be the same as the old password." });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password changed successfully." });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ error: error.message });
    }
};


// Allow users to delete their account.
exports.deleteUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
  }

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ error: "User not found." });
      }

      // Check if password is correct
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
          return res.status(401).json({ error: "Invalid credentials" });
      }

      await User.deleteOne({ email });

      res.json({ message: "User deleted successfully" });
  } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ error: "User not found" });

        const { firstName } = user;

        // Generate token
        const resetToken = crypto.randomBytes(16).toString("hex");
        const expiryTime = parseInt(process.env.RESET_PASSWORD_EXPIRY, 10) || 3600000; // Token valid for 1 hour if not set

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + expiryTime; 

        await Promise.all([
            user.save(), 
            resetPasswordEmail(firstName, email, resetToken)
        ]);

        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ error: "Invalid or expired token" });

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful. You can now log in." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Server error" });
    }
};