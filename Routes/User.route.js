import Express from "express";

import * as UserController from '../Controllers/User.controller.js'

import multer from '../Middleware/multer-config.js';

const router = Express.Router()

router.route('/register')
    .post(multer,UserController.register)

router.route('/login')
    .post(UserController.login)

export default router