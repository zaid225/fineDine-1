const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const uuid = require("uuid");

const isloggedin = require("../middleware/auth");
const Dish = require("../models/Dish");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

const { deleteOne } = require("../models/Restaurant");

const TOKENSECRET = "superSecretTokenOfQDineIn";

//ADMIN SIGNUP
Router.post("/signup", async (req, res, next) => {
  const { username, email, phoneno, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const data = {
    username: username,
    email: email,
    phoneno: phoneno,
    password: hashedPassword,
  };
  const tempAdmin = await Restaurant.findOne({
    email: email,
  });
  if (tempAdmin)
    return res.status(200).send({
      err: "Email Already exist",
    });
  const admin = await Restaurant.create(data);
  admin.save();
  const token = await jwt.sign(
    {
      id: admin._id,
      adminEmail: admin.email,
    },
    TOKENSECRET
  );
  res.status(200).send({
    token: token,
  });
});

//ADMIN LOGIN
Router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await Restaurant.findOne({
    email: email,
  });
  if (!admin)
    return res.status(200).send({
      err: "Email Not found",
    });
  const validpass = await bcrypt.compare(password, admin.password);
  if (!validpass)
    return res.status(200).send({
      err: "Invalid password",
    });
  const token = await jwt.sign(
    {
      id: admin._id,
      adminEmail: admin.email,
    },
    TOKENSECRET
  );
  res.status(200).send({
    token: token,
  });
});

//DISPLAYING ALL DISHES TO ADMIN
Router.get("/dish", isloggedin, async (req, res, next) => {
  const email = req.user.adminEmail;
  const rest = await Restaurant.findOne({
    email,
  })
    .populate("menu")
    .exec();

  res.status(200).json(rest.menu);
});

//GET A DISH WITH ID
Router.get("/dish/:dishid", async (req, res, next) => {
  const dish = await Dish.findOne({
    _id: req.params.dishid,
  });
  res.send(dish);
});

//ADD DISHES
Router.post("/dish", isloggedin, async (req, res, next) => {
  const data = req.body;
  const dish = await Dish.create(data);
  const restEmail = req.user.adminEmail;
  const rest = await Restaurant.findOne({
    email: restEmail,
  });
  rest.menu.push(dish._id);
  rest.save();
  res.send(dish);
});

//DELETE DISH
Router.delete("/dish/:dishid", isloggedin, async (req, res, next) => {
  const dish = await Dish.findOneAndDelete({
    _id: req.params.dishid,
  });
  const adminEmail = req.user.adminEmail;
  const rest = await Restaurant.findOne({
    email: adminEmail,
  });
  const index = rest.menu.indexOf(req.params.dishid);
  if (index != -1) {
    rest.menu.splice(index, 1);
  }
  rest.save();
  res.send(dish);
});

//UPDATE DISH
Router.put("/dish/:dishid", isloggedin, async (req, res, next) => {
  const dish = await Dish.findOneAndUpdate(
    {
      _id: req.params.dishid,
    },
    {
      $set: req.body,
    },
    {
      new: true,
    }
  );
  res.json(dish);
});

//GET ALL DISHES
Router.get("/", isloggedin, async (req, res, next) => {
  const restEmail = req.user.adminEmail;
  // console.log(restEmail);
  const rest = await Restaurant.findOne({
    email: restEmail,
  })
    .populate("menu")
    .exec();
  res.send(rest);
});

//UPDATE THE WHETHER THE ORDER IS PAID OR NOT
Router.put("/order/:id", isloggedin, async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          isPaid: req.body.isPaid,
        },
      },
      {
        new: true,
      }
    );
//     console.log(order);
    if (req.body.isPaid === true) {
      const user = await User.findOneAndUpdate(
        {
          _id: order.user,
        },
        {
          $push: {
            pastorders: req.params.id,
          },
          $set: {
            currentorder: null,
            currentRestId: null,
          },
        },
        {
          new: true,
        }
      );
      console.log(user);
      res.json(user);
    } else {
      const user = User.findOneAndUpdate(
        {
          _id: order.user,
        },
        {
          $set: {
            currentorder: req.params.id,
          },
        },
        {
          new: true,
        }
      );
    }
  } catch (error) {
    res.json(error);
  }
});

// GET ALL ORDERS
Router.get("/orders", isloggedin, async (req, res, next) => {
  const restId = req.user.id;
  var orders = [];
  (await Order.find()).map((order) => {
    console.log(order.restaurant);
    if (restId == order.restaurant) {
      orders.push(order);
    }
  });
  res.json(orders);
});

module.exports = Router;
