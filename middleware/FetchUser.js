const jwt = require("jsonwebtoken");
const JWT_SECRET = "Shashankis$good";

const fetchUser = (req, res, next) => {
  //Get the from the jwt token and add the id to req object
  const token = req.header("auth-token");

  //if token not exists
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    // next function call which fetch user detail from id in auth.js
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchUser;
