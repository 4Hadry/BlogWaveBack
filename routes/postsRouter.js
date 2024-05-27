var express = require("express");
const {
  createPost,
  getPosts,
  getUserPost,
  getPost,
  getCatPost,
  EditPost,
  deletePost,
} = require("../controller/postController");
const authMiddleware = require("../middleware/authMiddleware");
var router = express.Router();
/* GET users listing. */
router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.patch("/:id", authMiddleware, EditPost);
router.get("/categories/:category", getCatPost);
router.get("/users/:id", getUserPost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
