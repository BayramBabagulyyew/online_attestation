const express = require("express");
const testController = require("../controller/main");
const isLogin = require("../util/isLogin");

const router = express();

router.get("/", isLogin, testController.getMain);
router.get("/test/", isLogin, testController.getMain);

router.get("/test/test/", isLogin, testController.getTests);

router.post("/test/test", testController.postTests);

router.post("/test/ranks", testController.postRank);

// router.post("/new-test", testController.postNewTests);

router.post("/test/testing", testController.postTesting);

router.post("/test/next", testController.postNextTesting);

module.exports = router;
