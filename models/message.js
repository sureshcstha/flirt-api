const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Message must be provided."],
    trim: true,
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
        "inspirational",
        "nerd",
        "poetic",
        "romantic",
        "supportive",
      ],
      message: `{VALUE} is not a valid category. Please choose from "anniversary", "apologetic", "birthday", "cute", "dirty", "flirty", "funny", "gratitude", "inspirational", "nerd", "poetic", "romantic", or "supportive".`,
    },
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Message", messageSchema);
