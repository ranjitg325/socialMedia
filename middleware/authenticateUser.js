const jwt = require("jsonwebtoken");

exports.authenticateToken =  (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
      return res
        .status(401)
        .send({ settings: { success: "0", message: "Unauthorized request" } });
    const user =  jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).send(err.message);
  }
};