const User = require("../models/User");
const { body, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const TokenS = require("../models/Token");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.NODEMAILER_USER,
		pass: process.env.NODEMAILER_PASS,
	},
});

exports.signup = (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).json({
			error: errors.array()[0].msg,
		});
	}

	const name = req.body.name;
	const email = req.body.email;
	const pass = req.body.password;

	bcrypt.hash(pass, 10, (err, hash) => {
		const user = new User({
			name: name,
			email: email,
			password: hash,
		});

		user.save((er, userr) => {
			if (er) {
				return res.status(400).json({
					err: "NOT able to save user in DB",
				});
			}
			console.log(`user ${userr.email} created`);
			sendMail(userr, transporter, res);
		});
	});
};

const sendMail = (user, tran, res) => {
	var mailOptions = {
		from: "shreyxs@gmail.com",
		to: user.email,
		subject: "Account Verification Token",
		text:
			`Hello ${user.name},\n\n` +
			"Please verify your account by clicking the link: \nhttp://" +
			"localhost:2020" +
			"/confirmation?token=" +
			createToken(user.id) +
			"\n",
	};
	tran.sendMail(mailOptions, function (err, msg) {
		if (err) {
			console.log("send mail error -", err.message);
			res.status(500).json({ msg: err.message });
			return;
		} else {
			res.status(200).json(user);
			console.log(`Everything done - welcome ${user.name}!`);
			return;
		}
	});
};

const createToken = userID => {
	const tokenS = new TokenS({
		userId: userID,
		token: crypto.randomBytes(16).toString("hex"),
	});
	console.log("created token -", tokenS);
	tokenS.save((err, response) => {
		if (err) {
			console.log("unable to save token in db.");
			return;
		}
	});
	return tokenS.token;
};

exports.confirmationPost = (req, res, next) => {
	const errors = validationResult(req);
	const { token } = req.query;
	if (!errors.isEmpty()) {
		return res.status(422).json({
			error: errors.array()[0].msg,
		});
	}
	TokenS.findOne({ token }, function (err, token) {
		if (!token)
			return res.status(400).send({
				type: "not-verified",
				msg:
					"We were unable to find a valid token. Your token my have expired.",
			});

		User.findOne({ _id: token.userId }, function (e, user) {
			if (!user)
				return res
					.status(400)
					.send({ msg: "We were unable to find a user for this token." });
			if (user.isVerified)
				return res.status(400).send({
					type: "already-verified",
					msg: "This user has already been verified.",
				});

			user.isVerified = true;
			console.log(`${user.name} - Verified.`);
			user.save(function (er) {
				if (er) {
					return res.status(500).send({ msg: er.message });
				}
				res.status(200).json("The account has been verified. Please log in.");
			});
		});
	});
};

exports.signin = (req, res) => {
	const errors = validationResult(req);

	const { email, password } = req.body;

	if (!errors.isEmpty()) {
		return res.status(422).json({
			error: errors.array()[0].msg,
		});
	}

	User.findOne({ email }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "USER email does not exist",
			});
		}

		bcrypt.compare(password, user.password, function (er, result) {
			if (er) {
				console.log(er);
				res.json("wrong password");
			}
			if (!result) {
				res.status(401).json({
					error: "Email and password do not match",
				});
				return;
			}

			const token = jwt.sign({ _id: user._id }, process.env.SECRET);

			res.cookie("token", token, { expire: new Date() + 14 });

			console.log(`${user.name} signed in.`);
			req.app.locals.email = user.email;
			console.log(req.app.locals.email);
			return res.json({ token, user });
		});
	});
};

exports.signout = (req, res) => {
	delete req.app.locals.email;
	console.log(req.app.locals.email);
	res.clearCookie("token");
	res.json({
		message: "User signout successfully",
	});
};
