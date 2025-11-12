const express = require("express");
const adminController = require("../controller/admin");

const router = express();

router.get("/", adminController.getAdmin);

router.get("/add-test", adminController.getAddTest);

router.post("/add", adminController.postAdd);

router.get("/group", adminController.getAdminGroupUsers);

router.get("/profile", adminController.getAdminProfile);

router.post("/add-test", adminController.postAddTest);

router.post("/status", adminController.postStatus);

router.get("/add-group", adminController.getAddGroup);

router.post("/add-group", adminController.postAddGroup);

router.post("/delete", adminController.postDelete);

router.get("/logout", adminController.getLogout);

module.exports = router;
