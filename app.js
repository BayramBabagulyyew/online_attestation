const express = require("express");
const bParser = require("body-parser");
const loginRoute = require("./routes/login");
const testRoute = require("./routes/main");
const adminRoute = require("./routes/admin");
const path = require("path");
const sequelize = require("./util/database");
const User = require("./models/users");
const Test = require("./models/tests");
const Rank = require("./models/rank");
const Group = require("./models/group");
const Admin = require("./models/admin");
const GroupAdmin = require("./models/group-admin");
const session = require("express-session");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bParser.json());
app.use(bParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.static(path.join(__dirname, "public")));

const SequelizeStore = require("connect-session-sequelize")(session.Store);

const port = process.env.PORT || 4000;

const store = new SequelizeStore({
  db: sequelize,
  collection: "sessions",
});
app.use(
  session({
    secret: "my secret secret",
    resave: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.isAdmin && !req.session.isUser) {
    return next();
  }
  if (req.session.isAdmin) {
    Admin.findByPk(req.session.adminId)
      .then((admin) => {
        req.admin = admin;
        return next();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  if (req.session.isUser) {
    User.findByPk(req.session.userId)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //Doldurmalyyyy
});

app.use((req, res, next) => {
  if (req.session.isAdmin) {
    res.locals.isLoggedIn = req.session.isAdmin;
    res.locals.id = req.admin.id;
  } else if (req.session.isUser) {
    res.locals.isLoggedIn = req.session.isUser;
    res.locals.id = req.user.id;
  }
  next();
});
const isAdmin = require("./middlware/isAdmin");

app.use(loginRoute);
app.use(testRoute);
app.use(
  "/admin",
  isAdmin,

  adminRoute
);

app.use((req, res) => {
  res.status(404).render("p404", { pageTitle: "Error" });
});

Group.belongsToMany(Admin, { through: GroupAdmin });
Admin.belongsToMany(Group, { through: GroupAdmin });
1;
Group.hasMany(User, { constrains: true, onDelete: "CASCADE" });
User.belongsTo(Group);
Group.hasMany(Test);
Test.belongsTo(Group);
Rank.belongsTo(Group);
User.hasMany(Rank);
Admin.hasMany(Rank);
Admin.hasMany(Test, { constrains: true, onDelete: "CASCADE" });

sequelize
  .sync()
  // .sync({ force: true })
  .then(async () => {
    const adm = await Admin.findByPk(1);
    // console.log(await adm.getGroups());
    // await Admin.findOrCreate({
    //   where: { id: '1' }, defaults: {
    //     username: "Bayram",
    //     password: "1234"
    //   }
    // });
    // await Group.findOrCreate({
    //   where: { id: "1" },
    //   defaults: {
    //     group: "3311"
    //   }
    // })
    // await GroupAdmin.findOrCreate({
    //   where: { id: "1" },
    //   defaults: {
    //     groupId: "1",
    //     adminId: "1"
    //   }
    // })

    app.listen(port, () => {
      console.log(`WORKING ON PORT ${port}`);
    });
  })
  .catch((err) => console.log(err));
