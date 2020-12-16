require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My routes
const userRoutes = require("./routes/User");
const addRoutes = require("./routes/add");

mongoose
	.connect(process.env.DATABASE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("DB CONNECTED");
	});

//Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static("uploads"));

//My Routes
app.use("/", userRoutes);
app.use("/", addRoutes);

//Port
const port = process.env.PORT || 2020;

//Starting a server
app.listen(port, () => {
	console.log(`app is running at ${port}`);
});
