const Group = require("../models/group");
const Admin = require("../models/admin");
const GroupAdmin = require("../models/group-admin");

exports.getAdmin = (req, res, next) => {
  const adminId = req.query.id;
  Admin.findByPk(adminId)
    .then((admin) => {
      admin.getGroups().then(async (groups) => {
        const groupUser = [];
        for (let i = 0; i < groups.length; i++) {
          const users = await groups[i].getUsers();
          const userCount = users.length;
          groupUser.push({
            group: groups[i].group,
            count: userCount,
            users: users,
          });
        }
        res.render("admin/admin", {
          pageTitle: "Add",
          error: null,
          admin: admin,
          groups: groups,
          groupUser: groupUser,
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.getAddTest = (req, res, next) => {
  const id = req.query.id;
  const group = req.query.group || null;
  if (!group) {
    Admin.findByPk(id)
      .then((admin) => {
        admin
          .getGroups()
          .then(async (groups) => {
            const groupTest = [];
            for (let i = 0; i < groups.length; i++) {
              const tests = await groups[i].getTests({
                where: { adminId: id },
              });
              const testCount = tests.length;
              groupTest.push({
                group: groups[i],
                count: testCount,
                // users: users,
              });
            }

            res.render("admin/addtest", {
              pageTitle: "Add",
              admin: admin,
              grouptest: groupTest,
              add: false,
              group: null,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  } else {
    Admin.findByPk(id)
      .then((admin) => {
        admin
          .getGroups()
          .then((groups) => {
            res.render("admin/addtest", {
              pageTitle: "Add",
              admin: admin,
              groups: groups,
              add: true,
              group: group,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
};

exports.getAdminGroupUsers = (req, res, next) => {
  const { id, group } = req.query;
};

exports.getAdminProfile = (req, res, next) => {
  console.log("Adad");
  const id = req.query.id;

  Admin.findByPk(id)
    .then((admin) => {
      res.render("admin/profile", {
        pageTitle: "Admin Profile",
        admin: admin,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddTest = (req, res, next) => {
  const { question, correct, answer1, answer2, answer3 } = req.body;
  const { id, group } = req.query;
  Group.findByPk(group)
    .then((grp) => {
      grp
        .createTest({
          question: question,
          answer: correct,
          fake1: answer1,
          fake2: answer2,
          fake3: answer3,
          adminId: id,
        })
        .then(() => {
          console.log("succes");
          res.json("succes");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddGroup = (req, res, next) => {
  const adminId = req.query.id;
  const group = req.body.group;

  Admin.findByPk(adminId)
    .then((admin) => {
      admin.getGroups({ where: { group: group } }).then((groups) => {
        if (groups) {
          return res.status(422).json({ message: "Alreade added" });
        }

        admin
          .createGroup({
            group: group,
          })
          .then(res.status(200).json({ message: "Success" }))
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAdd = (req, res, next) => {
  const id = req.query.id;
  const group = req.query.group;
  res.status(200).json({ url: `/admin/add-test?id=${id}&group=${group}` });
};

exports.postStatus = async (req, res, next) => {
  const groupId = req.body.groupId;
  const id = res.locals.id;
  let gadmin = await GroupAdmin.findOne({
    where: { adminId: id, groupId: groupId },
  });
  let stts = gadmin.status;
  if (stts === false) {
    stts = true;
  } else {
    stts = false;
  }

  GroupAdmin.update(
    { status: stts }, // New values for join table attributes
    { where: { adminId: id, groupId: groupId } } // Filter criteria
  )
    .then(() => {
      res.status(200).json(stts);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDelete = (req, res, next) => {
  const id = req.query.id;
  Admin.destroy({ where: { id: id } })
    .then(() => {
      return req.session.destroy();
    })
    .then(() => {
      res.status(200).json("succesfully deleted!");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/test/login");
  });
};
