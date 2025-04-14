const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Message must be provided."],
    trim: true,
    unique: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: {
      values: [
        "anniversary",
        "apologetic",
        "birthday",
        "cute",
        "dirty",
        "flirty",
        "funny",
        "gratitude",
        "heartfelt",
        "inspirational",
        "nerd",
        "poetic",
        "romantic",
        "supportive",
        "valentine's day",
      ],
      message: `{VALUE} is not a valid category. Please choose from "anniversary", "apologetic", "birthday", "cute", "dirty", "flirty", "funny", "gratitude", "heartfelt", "inspirational", "nerd", "poetic", "romantic", "supportive", or "valentine's day".`,
    },
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: {
      values: [
        "draft",
        "published",
      ],
      message: `{VALUE} is not a valid status.`,
    },
    default: "draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field for like count
messageSchema.virtual('likeCount').get(function () {
  return this.likedBy.length;
});

// To include virtuals when converting to JSON or Object
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Message", messageSchema);
