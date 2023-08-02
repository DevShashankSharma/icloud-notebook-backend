const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/FetchUser");

const JWT_SECRET = "Shashankis$good"; // Secret -> use in making token

//Route 1 :  Creating a User using : POST "/api/auth/createUser". Doesn't require login  => sign up EndPoint
router.post(
  "/createUser",
  //checks(conditions) for creating a user
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password consists of atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    //If there are errors then return Bad request and the errors
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    //Check whether the user with this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      //if user already exits with this email then
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry user with email address already exits" });
      } else {
        //Hashing and salting the password with the npm package bcryptjs
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        //create a new user
        user = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: secPass,
        });
      }

      //Sending a token to User using jwt
      const data = {
        user: {
          id: user.id,
        },
      };
      //creating token
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      // res.json(user);
      res.json({ success, authToken });

      //catch error
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route 2 :  Authenticating a User using : POST "/api/auth/loginUser". Doesn't require login  => Login EndPoint
router.post(
  "/login",
  //checks for login a user
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cann't be blank").exists(),
  ],
  async (req, res) => {
    //If there are errors then return Bad request and the errors
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      //Checking whether the user exists or not with email
      let user = await User.findOne({ email });
      //if User not exists
      if (!user) {
        return res
          .status(400)
          .json({success, error: "Please try to login with correct credentials" });
      }
      //if email id is valid then checking password
      const passwordCompare = await bcrypt.compare(password, user.password);
      // if password is incorrect
      if (!passwordCompare) {
        return res
          .status(400)
          .json({success, error: "Please try to login with correct credentials" });
      }

      //Sending a token to User using jwt
      const data = {
        user: {
          id: user.id,
        },
      };
      //creating token
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success,authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route 3 :  get loggedin User details using : POST "/api/auth/getUser". login require  => getUser details EndPoint
router.post("/getUser", fetchUser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
