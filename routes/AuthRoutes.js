const Auth = require('../controllers/AuthController');
const express = require('express');
const Router = express.Router();

Router.post('/signup', Auth.SignUp)
Router.post('/signin',Auth.SignIn)


module.exports = Router;