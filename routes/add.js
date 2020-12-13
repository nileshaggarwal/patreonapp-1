const express = require("express");
const router = express.Router();
const { createCategory, addLogos } = require("../controllers/category");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });
const fonts = require("../models/fonts");

router.post("/category", createCategory);
router.post("/font", upload.array("fonts", 10), addLogos);
router.get("/font", (req, res) => {
	fonts.find({}, (er, fnts) => {
		return res.json(`<img src=${fnts[1].fonts[1]}/>`);
	});
});

module.exports = router;
