const Category = require("../models/category");

exports.addCategory = (req, res) => {
	const { name, tier } = req.body;
	console.log(req.files, req.body);
	const fonts = req.files.map((photo) => {
		const { encoding, mimetype, path } = photo;
		return { encoding, mimetype, path };
	});
	const categ = new Category({ name, tier, fonts });

	categ.save((err, cate) => {
		if (err) {
			console.log(err);
			res.status(400).json({
				error: "Error saving in db",
			});
		}
		res.json(cate);
	});
};
