const express = require("express");
const loginController = require("../controller/login");

const { check, body } = require("express-validator");

const User = require("../models/users");

const router = express();

router.get("/test/login", loginController.getLogin);

router.get("/test/logout", loginController.getLogout);

router.get("/test/signup", loginController.getSignup);

router.post(
  "/test/login",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("Please enter valid email or username"),
    body("password", "Please enter valid password").isLength({ min: 3 }),
  ],
  loginController.postLogin
);

router.post(
  "/test/signup",
  [
    check("group").isLength({ max: 4 }).withMessage("Incorrect Group number"),
    check("name")
      .isLength({ min: 3 })
      .withMessage("Username has to be least 3 characters"),
    body("cardId", "Please enter a valid Id Card number").isNumeric(),
    check("password")
      .isLength({ min: 3 })
      .withMessage("Password has to be least 3 characters"),
    body("conPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
    body("name").custom((value, { req }) => {
      return User.findOne({ where: { username: value } }).then((user) => {
        if (user) {
          return Promise.reject(
            "Username exists already, please pick a different one."
          );
        }
      });
    }),
    // body("email").custom((value, { req }) => {
    //   return User.findOne({ where: { email: value } }).then((user) => {
    //     if (user) {
    //       return Promise.reject(
    //         "E-Mail exists already, please pick a different one."
    //       );
    //     }
    //   });
    // }),
  ],
  loginController.postSignup
);

router.post("/login-admin", loginController.postLoginAdmin);

module.exports = router;
