const { validationResult } = require("express-validator");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const Admin = require("../models/admin");
const Group = require("../models/group");

exports.getLogin = (req, res, next) => {
  res.render("login", {
    pageTitle: "Login",
    errMessage: "Your password is incorrect",
    isLoggedIn: null,
  });
};

exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    res.redirect("/test/login");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("signup", {
    pageTitle: "Login",
    isLoggedIn: null,
  });
};

exports.postSignup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ error: error.array()[0].msg });
  }
  const name = req.body.name;
  const cardId = req.body.cardId;
  const password = req.body.password;
  const group = req.body.group;

  const hashPass = await bcrypt.hash(password, 12);

  Group.findOne({ where: { group: group } })
    .then((thgroup) => {
      if (!thgroup) {
        return res.json({ error: "Topar tapylmady" });
      }
      thgroup
        .createUser({
          username: name,
          cardId: cardId,
          password: hashPass,
        })
        .then(() => {
          res.status(200).json({ url: "/test" });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => console.log(err));
};

exports.postLoginAdmin = (req, res, next) => {
  const { pass } = req.body;

  Admin.findOne({ where: { password: pass } })
    .then((admin) => {
      // res.setHeader("Set-Cookie", `loggedIn=true,admin-${admin.id}`);
      if (admin) {
        req.session.isAdmin = true;
        req.session.adminId = admin.id;
        return res.status(200).json({ url: `/admin?id=${admin.id}` });
      }
      res.status(422).json({ error: "Incorrect private key!" });
    })
    .catch((err) => {
      console.log(err);
    });

  console.log(pass);
};

exports.postLogin = (req, res, next) => {
  const { name, password } = req.body;
  if (name === "admin" && password === "admin") {
    return res.json({ prompt: "yess" });
  }

  User.findOne({ where: { cardId: name } })
    .then(async function fk(user) {
      if (user) {
        const compare = await bcrypt.compare(password, user.password);
        return { pass: compare, id: user.id };
      }
      return { error: "Id not found" };
    })
    .then((result) => {
      if (result.error) {
        return res.status(422).json({ error: result.error });
      }
      if (result.pass) {
        // res.setHeader("Set-Cookie", `loggedIn=true,${result.id}`);
        req.session.isUser = true;
        req.session.userId = result.id;
        return res.status(200).json({ url: `/test/?id=${result.id}` });
      }
      res.status(422).json({ error: "Wrong password" });
    })
    .catch((err) => {
      console.log(err);
    });
};
