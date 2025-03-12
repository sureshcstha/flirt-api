const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, maxlength: 100, trim: true, lowercase: true},
    password: { 
        type: String, 
        required: true, 
        minlength: 12,
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^?&*()-_+=\[\]{}~`])[A-Za-z\d!@#$%^?&*()-_+=\[\]{}~`]{12,}$/.test(value);
            },
            message: "Password must be at least 12 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
        }
    },
    role: { 
        type: String, 
        enum: ["guest", "contributor", "editor", "admin", "superadmin"], 
        default: "guest"
    },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if new password is the same as the old password
userSchema.methods.isSamePassword = async function (newPassword) {
  return await bcrypt.compare(newPassword, this.password);
};

// Generate a verification token before saving
userSchema.methods.generateVerificationToken = function () {
    this.verificationToken = crypto.randomBytes(16).toString("hex");
};

const User = mongoose.model("User", userSchema);
module.exports = User;