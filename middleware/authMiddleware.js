const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const Authorization = req.header.Authorization || req.headers.authorization;
  if (Authorization && Authorization.startsWith("Bearer ")) {
    const token = Authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SCERT, (err, info) => {
      if (err) {
        return res.send("Unautorized Invalid token " + err);
      }

      req.user = info;
      next();
    });
  } else {
    return res.send("Unautorized. No token");
  }
};

module.exports = authMiddleware;
