import '../Models/User.model.js';
import User from '../Models/User.model.js';
//import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export function register(req, res) {

    bcrypt.hash(req.body.password, 10, function (err, hashedPassword) {
        if (err) {
            res.json({
                error: err
            })
        }
        let user = new User({
            username: req.body.username,
            password: hashedPassword,
            mail: req.body.mail,
            image: `${req.protocol}://${req.get('host')}/img/${req.body.image}`,
            role: req.body.role
        })

        if(req.body.password === req.body.confirmpassword) {

        user
            .save()
            .then(user => {
                res.json({
                    message: "User Added Successfully"
                })
            })
            .catch(err => {
                res.json({
                    error: err
                })
            })} else {
                res.json({err : "Passwords Dont Mach"})
            }
    })
}

export function login (req, res, next) {
    var password = req.body.password;
    var username = req.body.username;

    User.findOne({$or: [{username:username},{password:password}]})
    .then(user => {
        if(user) {
            bcrypt.compare(password, user.password, function(err, result) {
                if (err) {
                    res.json({
                        error: err
                    })
                }
                if (result) {
                    let token = jwt.sign({username: user.username, password: user.password}, "VerySecretValue", {expiresIn: '1H'})
                    res.json({
                        message: 'Login Successful',
                        token
                    })
                } else {
                    res.json({
                        message: 'No User Found'
                        
                    })
                }
            })
        } else {
            res.json({
                message: 'No User Find'
            })
        }
    })
}