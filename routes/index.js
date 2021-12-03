const express = require("express");
const router = express.Router();

// import user controller.
const UserController = require("../controllers/index").UserController;

// API Routes for User

router.post("/user", UserController.AddUser);




// export router;
module.exports = router;