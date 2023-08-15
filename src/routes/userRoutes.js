const express = require('express');
const { model } = require('mongoose');
const { signup, signin, scrape } = require('../controllers/userControllers');
const auth = require("../middleware/auth");
const userRouter=express.Router();

userRouter.get("/signup",signup);

userRouter.post("/signin",signin);

userRouter.post("/scrape", auth ,scrape);


module.exports = userRouter;