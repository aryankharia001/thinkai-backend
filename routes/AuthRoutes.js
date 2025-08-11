const Auth = require('../controllers/AuthController');
const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const Router = express.Router();

Router.post('/signup', Auth.SignUp)
Router.post('/signin',Auth.SignIn)

Router.get("/me", verifyToken, Auth.getMe);

module.exports = Router;