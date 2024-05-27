var express = require("express");
var router = express.Router();
const {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
  EditUser,
  getAuthers,
} = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
/* GET users listing. */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.get("/", getAuthers);
router.post("/change-avatar", authMiddleware, changeAvatar);
router.patch("/edit-user", authMiddleware, EditUser);

module.exports = router;
