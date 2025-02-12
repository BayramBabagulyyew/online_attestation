const Rank = require("../models/rank");
const User = require("../models/users");
const Group = require("../models/group");

exports.getTests = async (req, res, next) => {
  const { ad, q } = req.query;

  res.render("test", {
    pageTitle: "Test",
    question: q,
    adminId: ad,
  });
};

exports.postTests = async (req, res, next) => {
  const adminId = req.query.ad;
  const user = await User.findByPk(res.locals.id);
  const group = await Group.findByPk(user.groupId);
  const test = await group.getTests();
  const count = test.length;

  Rank.findOne({ where: { adminId: adminId, userId: res.locals.id } })
    .then((rank) => {
      if (rank) {
        const question = rank.question || 0;
        if (question >= count) {
          return res
            .status(422)
            .json({ error: "Your chance to enter is over!" });
        }
        return res
          .status(200)
          .json({ url: `/test/test?ad=${adminId}&q=${question}` });
      }
      return res.status(200).json({ url: `/test/test?ad=${adminId}&q=${0}` });
    })

    .catch((err) => {
      console.log(err);
      throw err;
    });
};

exports.postRank = (req, res, next) => {
  const { ad, g } = req.query;
  Group.findByPk(g)
    .then((group) => {
      group
        .getUsers()
        .then(async (users) => {
          const ranks = [];

          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const rnk = await user.getRanks({
              where: { adminId: ad },
            });
            const rank = rnk[0];
            ranks.push({ user, rank });
          }
          for (let i = 0; i < ranks.length - 1; i++) {
            for (let j = i; j < ranks.length; j++) {
              if (ranks[i].rank && ranks[j].rank) {
                if (ranks[i].rank.rank < ranks[j].rank.rank) {
                  [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
                }
              }
            }
          }
          res.status(200).json(ranks);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });

  // User.findByPk(res.locals.id)
  //   .then((user) => {
  //     user
  //       .getRanks({ where: { adminId: ad }, order: [["rank", "DESC"]] })
  //       .then((ranks) => {
  //         console.log(ranks);
  //         res.json(ranks);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

// exports.getNewTests = (req, res, next) => {
//   console.log(res.locals.id);
//   if (!res.locals.isLoggedIn) {
//     return res.redirect("/test/login");
//   }
//   res.render("new-test", {
//     pageTitle: "Enter New test",
//   });
// };

exports.getMain = async (req, res, next) => {
  if (!res.locals.isLoggedIn) {
    return res.redirect("/test/login");
  }

  User.findByPk(res.locals.id)
    .then((user) => {
      // console.log(user);
      Group.findByPk(user.groupId)
        .then(async (group) => {
          group
            .getAdmins()
            .then(async (admins) => {
              const available = [];
              for (let i = 0; i < admins.length; i++) {
                if (admins[i].groupAdmin.status) {
                  available.push({
                    admin: admins[i],
                  });
                }
              }

              res.render("main", {
                pageTitle: "Main",
                available: available,
                error: null,
                group: group,
              });

              /////sadfhsjfhshjalsfhksajhfklasfk
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      next(err);
    });
};

// exports.postNewTests = (req, res, next) => {
//   const { question, correct, mistake1, mistake2, mistake3 } = req.body;
//   Test.create({
//     question: question,
//     answer: correct,
//     fake1: mistake1,
//     fake2: mistake2,
//     fake3: mistake3,
//   })
//     .then(() => {
//       res.render("new-test", {
//         pageTitle: "Enter New Test",
//       });
//     })
//     .catch((err) => console.log(err));
// };

exports.postTesting = (req, res, next) => {
  const adminId = req.body.adminId;
  // const groupId = res.locals.user.groupId;

  User.findByPk(res.locals.id).then(async (user) => {
    user
      .getRanks({ where: { adminId: adminId, groupId: user.groupId } })
      .then((rank) => {
        if (rank.length > 0) {
          return rank[0].id;
        }
        return user
          .createRank({
            groupId: user.groupId,
            adminId: adminId,
          })
          .then((rank) => {
            return rank.id;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      })
      .then(async (id) => {
        const group = await Group.findByPk(user.groupId);

        group
          .getTests({ where: { adminId: adminId } })
          .then((tests) => {
            return res.status(200).json({ tests: tests, rankId: id });
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      })
      // .then(async (group) => {

      //   // Test.findAll({ where: { group: group, adminId: adminId } })
      //   //   .then((tests) => {
      //   //     res.json(tests);
      //   //   })
      //   //   .catch((err) => console.log(err));
      // })
      .catch((err) => {
        console.log(err);
        throw err;
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  });
};

exports.postNextTesting = (req, res, next) => {
  const { question, testId, answer, adminId, rankId } = req.body;
  if (question < 10) {
    Rank.findByPk(rankId)
      .then(async (rank) => {
        const right = rank.right + +answer;

        rank.question = 1 + +question;
        rank.right = right;
        await rank.save();
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });

    if (question < 9) {
      res.status(200).json(1 + +question);
    } else {
      Rank.findByPk(rankId)
        .then((rank) => {
          const right = rank.right + +answer;
          const countTest = 1 + +rank.question;
          const point = Math.round((right / countTest) * 100);
          rank.update({
            rank: point,
          });
        })
        .catch((err) => {
          next(err);
        });
      res.status(200).json({ url: "/test" });
    }

    // console.log(question, testId, answer, adminId);

    // User.findByPk(res.locals.id)
    //   .then((user) => {
    //     user
    //       .getRank()
    //       .then()
    //       .catch((err) => console.log(err));
    //   })
    //   .catch((err = console.log(err)));
  }
};
