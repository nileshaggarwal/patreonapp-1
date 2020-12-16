const express = require("express");
const router = express.Router();
const { addCategory } = require("../controllers/category");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/font", upload.array("fonts", 10), addCategory);

module.exports = router;
