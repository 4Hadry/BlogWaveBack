const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    posts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);
const users = mongoose.model("user", userSchema);
module.exports = users;
