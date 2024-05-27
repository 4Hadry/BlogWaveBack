const { default: mongoose } = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Agriculture",
        "Business",
        "Education",
        "Entertainment",
        "Art",
        "Uncategorized",
        "Weather",
      ],
      message: "VALUE is not supported!",
    },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);
const Post = mongoose.model("Post", postSchema);
module.exports = Post;
