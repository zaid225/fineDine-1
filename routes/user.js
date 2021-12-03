const express = require("express");
const Router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const isloggedin = require("../middleware/auth");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const Dish = require("../models/Dish");
const mail = require("../utils/mail");
const {
	find
} = require("../models/Dish");

const TOKENSECRET = "superSecretTokenOfQDineIn";
require("dotenv").config();

//SIGNUP
Router.post("/signup", async (req, res, next) => {
	const {
		username,
		email,
		phoneno,
		password
	} = req.body;

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const data = {
		username: username,
		email: email,
		phoneno: phoneno,
		password: hashedPassword,
	};
	const tempUser = await User.findOne({
		email: email,
	});
	if (tempUser)
		return res.status(200).send({
			err: "Email Already exist",
		});
	const user = await User.create(data);
	user.save();
	const token = await jwt.sign({
			id: user._id,
			userEmail: user.email,
		},
		TOKENSECRET
	);
	res.status(200).send({
		token: token,
	});
});

//LOGIN
Router.post("/login", async (req, res, next) => {
	const {
		email,
		password
	} = req.body;
	const user = await User.findOne({

		email: email,
	});
	if (!user)
		return res.status(200).send({
			err: "Email Not found",
		});
	const validpass = await bcrypt.compare(password, user.password);
	if (!validpass)
		return res.status(200).send({
			err: "Invalid password",
		});
	const token = await jwt.sign({
			id: user._id,
			userEmail: user.email,
		},
		TOKENSECRET
	);
	res.status(200).json({
		message: "Signed in successfully",
		token,
	});
});


Router.get("/", isloggedin, async (req, res) => {
	const {
		userEmail
	} = req.user;
	const response = await User.findOne({
		email: userEmail
	});
	if (response) {
		return res.status(200).send(response);
	}
	return res.status(200).send({
		err: "Something went wronge!"
	});
});

//RESET PASSWORD
Router.post("/resetpassword", isloggedin, async (req, res, next) => {
	const {
		oldPassword,
		newPassword
	} = req.body;
	const userEmail = req.user.userEmail;
	const user = await User.findOne({
		email: userEmail,
	});
	const validpass = await bcrypt.compare(oldPassword, user.password);
	if (validpass) {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);
		user.password = hashedPassword;
		user.save();
		res.status(200).json(user);
	} else {
		res.status(200).json({
			err: "Incorrect old password",
		});
	}
});


//FORGOT PASSWORD
Router.post("/forgotpassword", async (req, res, next) => {
	const {
		email
	} = req.body;
	const user = await User.findOne({
		email,
	});
	if (user) {
		var pass = "";
		var str =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789@#$";
		for (i = 1; i <= 8; i++) {
			var char = Math.floor(Math.random() * str.length + 1);
			pass += str.charAt(char);
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(pass, salt);
		user.password = hashedPassword;
		user.save();
		mail(
			email,
			"Reset Password Link",
			`
  <p>Hello ${user.username}, 
  <br/><br/>
  We heard that you lost your password. Sorry about that! 
  <br/><br/>
  But don’t worry! You can use the following password to login.
  <br/><br/>
  Password : ${pass}
  <br/><br/>
  If you did not request this, please ignore this email and your password will be ${pass}.
  <br/><br/>
  Thanks, <br/>
  Fine-Dine Team 
  </p>
  `
		);
		res.status(200).json({
			msg: "Reset Password mail has been sent..",
		});
	} else {
		res.status(200).json({
			err: "Invalid Email Address",
		});
	}
});

//GET ALL RESTAURANTS
Router.get("/restaurant", isloggedin, async (req, res, next) => {
	try {

		const user = await User.findOne({
			_id: req.user.id
		});
		if (user.currentRestId == null || user.currentRestId == "") {
			const response = await Restaurant.find();
			res.json(response);
		} else {
			const response = await Restaurant.find({
				_id: user.currentRestId
			});
			res.json(response);

		}

	} catch (err) {
		console.log(err);
		res.status(200).json({
			message: "You can't be here",
		});
	}
});

Router.get("/restaurant/:id", async (req, res, next) => {
	try {
		const restaurant = await Restaurant.findOne({
			_id: req.params.id,
		});
		res.json(restaurant);
	} catch (err) {
		res.json({
			message: err,
		});
	}
});

Router.get("/restaurant/:id/menu", async (req, res, next) => {
	try {
		const restaurant = await Restaurant.findOne({
				_id: req.params.id,
			})
			.populate("menu")
			.exec();
		res.json(restaurant);
	} catch (err) {
		res.json({
			message: err,
		});
	}
});



//PLACE ORDER IN A RESTAURANT
Router.post("/restaurant/:id/order", isloggedin, async (req, res, next) => {
	const userEmail = req.user.userEmail;
	const user = await User.findOne({
		email: userEmail,
	});
	const restId = req.params.id;
	if (user.currentorder == null) {
		const data = req.body;
		var tempDish = [];
		var orderTotal = 0;
		for (var i = 0; i < data.dish.length; i++) {
			let dishid = data.dish[i]._id;
			const orderDishes = await Dish.findOne({
				_id: dishid,
			});
			let total = orderDishes.price * data.dish[i].quantity;
			orderTotal = orderTotal + total;
			let tempData = {
				orderDishes,
				qnt: data.dish[i].quantity,
				total,
			};
			tempDish.push(tempData);
		}
		const order = await Order.create({
			dish: tempDish,
			user: user._id,
			orderTotal: orderTotal,
			restaurant: restId,
		});
		// const md = Object.assign({}, {
		// 	...data,
		// 	restId: req.params.id
		// })
		user.currentorder = order._id;
		user.currentRestId = req.params.id;
		user.save();
		// order.save();
		console.log(order);
		console.log(user);
		res.send(order);
	} else {
		const orderId = user.currentorder._id;
		const data = req.body;
		const updatedOrder = await Order.findOne({
			_id: orderId,
		});
		let orderTotal = updatedOrder.orderTotal;
		for (let i = 0; i < data.dish.length; i++) {
			let dishid = data.dish[i]._id;
			const orderDishes = await Dish.findOne({
				_id: dishid,
			});
			let total = orderDishes.price * data.dish[i].quantity;
			orderTotal = orderTotal + total;
			let tempData = {
				orderDishes,
				qnt: data.dish[i].quantity,
				total,
			};
			updatedOrder.dish.push(tempData);
		}
		updatedOrder.orderTotal = orderTotal;
		updatedOrder.save();
		res.json(updatedOrder);
	}
});

Router.get("/order", isloggedin, async (req, res, next) => {
	const userEmail = req.user.userEmail;
	const user = await User.findOne({
		email: userEmail,
	});
	if (user.currentorder == null) {
		return res.status(200).send({
			data: [],
		});
	} else {
		const orderId = user.currentorder._id;
		var updatedOrder = await Order.findOne({
			_id: orderId,
		});
		res.json(updatedOrder);
	}
});

module.exports = Router;