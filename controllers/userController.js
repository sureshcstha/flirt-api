const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, resetPasswordEmail } = require("../services/emailService");
const { sanitizeInput } = require('../utils/helpers');

const REDIRECT_URL = process.env.USER_VERIFICATION_REDIRECT_URL || "http://localhost:3000/login";
const isProduction = process.env.NODE_ENV === "production";

// Define expiration times
const accessTokenExpiresIn = 30 * 60; // 30 minutes
const refreshTokenExpiresIn = 7 * 24 * 60 * 60; // 7 days

// User Signup
exports.signup = async (req, res) => {
    let { firstName, lastName, email, password } = req.body;

    firstName = sanitizeInput(firstName);
    lastName = sanitizeInput(lastName);
    email = sanitizeInput(email);

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "First name, email and password are required." });
    }

    // Password format check before hitting DB
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^?&*()-_+=\[\]{}~`])[A-Za-z\d!@#$%^?&*()-_+=\[\]{}~`]{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
        });
    }

    try {
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            return res.status(400).json({ error: "Email already registered." });
        }

        const verificationToken = crypto.randomBytes(16).toString("hex");

        // Check if this is the first user
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? "superadmin" : "contributor"; // Assign 'superadmin' to the first user

        user = new User({
            firstName,
            lastName: lastName || "",
            email,
            password,
            verificationToken,
            isVerified: false,
            role
        });

        await user.save();

        try {
            await sendVerificationEmail(email, firstName, verificationToken);
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }

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
      
      if (!user) {
        if (req.headers.accept && req.headers.accept.includes("text/html")) {
            return res.redirect(`${REDIRECT_URL}?status=invalid`);
        } else {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
      }
  
      // Mark user as verified
      user.isVerified = true;
      user.verificationToken = undefined; // Remove token after verification
      await user.save();

      // Check if request is from a browser or API client
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        // Redirect to frontend login page
        return res.redirect(`${REDIRECT_URL}?status=verified`);
      } 
  
      // Return JSON response for API requests
      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      res.status(500).json({ message: "Error verifying email", error });
    }
};
  

// Allow users to authenticate
exports.login = async (req, res) => {
    let { email, password } = req.body;

    email = sanitizeInput(email);

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "Invalid email or password." });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email first." });  
        } 

        // Check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

       // Generate access token
       const accessToken = jwt.sign(
           { userId: user._id, role: user.role },
           process.env.JWT_SECRET,
           { expiresIn: accessTokenExpiresIn }
       );

       // Generate refresh token
       const refreshToken = jwt.sign(
           { userId: user._id },
           process.env.JWT_REFRESH_SECRET,
           { expiresIn: refreshTokenExpiresIn }
       );

       // Store refresh token in DB
       user.refreshToken = refreshToken;
       await user.save();

       // Set tokens in cookies
       res.cookie("access_token", accessToken, {
           httpOnly: true,
           secure: isProduction,
           sameSite: "None",
           maxAge: accessTokenExpiresIn * 1000,
       });

       res.cookie("refresh_token", refreshToken, {
           httpOnly: true,
           secure: isProduction,
           sameSite: "None",
           maxAge: refreshTokenExpiresIn * 1000,
       });

       res.json({
            message: "Login successful.",
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
};

//  To refresh the access token when the old one expires
exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        return res.status(403).json({ error: "Refresh token is required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: accessTokenExpiresIn }
        );

        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "None",
            maxAge: accessTokenExpiresIn * 1000,
        });

        res.json({ message: "Token refreshed." });
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired refresh token" });
    }
};


// Change Password
exports.changePassword = async (req, res) => {
    let { email, currentPassword, newPassword } = req.body;

    email = sanitizeInput(email);

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
  let { email, password } = req.body;

  email = sanitizeInput(email);

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
    let { email } = req.body;

    email = sanitizeInput(email);

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

// Logout 
exports.logout = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized request." });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Remove refresh token from DB
        user.refreshToken = null;
        await user.save();

        // Clear cookies
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: "None",
            path: "/"
        });
        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: "None",
            path: "/"
        });

        res.json({ message: "Logged out successfully." });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Logout failed. Please try again." });
    }
};
