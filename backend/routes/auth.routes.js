const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

module.exports = router;
