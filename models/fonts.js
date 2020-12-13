const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const fontSchema = new mongoose.Schema(
	{
		category: {
			type: ObjectId,
			ref: "Category",
		},
		fonts: [],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Fonts", fontSchema);
