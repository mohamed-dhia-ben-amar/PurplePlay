import '../Models/User.model.js';
import User from '../Models/User.model.js';
import Otp from '../Models/OTPVerif.model.js'
//import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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
            role: req.body.role,
            verified: false
        })

        if (req.body.password === req.body.confirmpassword) {

            user
                .save()
                .then(user => {
                    sendOTP(user.id, user.mail)
                    res.json({
                        message: "User Added Successfully"
                    })
                })
                .catch(err => {
                    res.json({
                        error: err
                    })
                })
        } else {
            res.json({ err: "Passwords Dont Mach" })
        }
    })
}

export function login(req, res, next) {
    var password = req.body.password;
    var username = req.body.username;

    User.findOne({ $or: [{ username: username }, { password: password }] })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) {
                        res.json({
                            error: err
                        })
                    }
                    if (result) {
                        let token = jwt.sign({ username: user.username, password: user.password }, "VerySecretValue", { expiresIn: '1H' })
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

export async function sendOTP({ _id, email }, res) {

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: "mohameddhiabenamar@gmail.com",
            pass: "gzhtclhwtaznnbts"
        }
    })
    transporter.verify().then(console.log).catch(console.error);
    const otpcode = `${Math.floor(1000 + Math.random() * 9000)}`
    transporter.sendMail({
        from: '"Mohamed Dhia Ben Amar" <mohameddhiabenamar@gmail.com>',
        to: "mohameddhia.benamar@esprit.tn",
        subject: "Verify Your Email",
        html: `<p>Enter <b>${otpcode}</b> To Verify Email</p>`
    }).then(async info => {
        console.log({ info });
        const hashedotp = await bcrypt.hash(otpcode, 10)
        const newotp = new Otp({
            user: _id,
            code: hashedotp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000
        })
        newotp.save()
    }).catch(console.error);
}

export async function VerifyEmailasync(req, res) {
    let userId = req.body.userId;
    let otpId = req.body.otpId;
    let otpcode = req.body.otpcode;
    if (!userId || !otpcode) {
        throw Error("Empty otp details are not allowed");
    } else {
        const UserOTPVerifRecords = await Otp.find({
            id: otpId
        });
        if (UserOTPVerifRecords.length <= 0) {

        } else {
            const { expiresAt } = UserOTPVerifRecords[0]
            const hashedOTP = await bcrypt.hash(otpcode, 10)
            if (expiresAt < Date.now()) {
                // user otp record has expired
                await Otp.deleteMany({ otpId });
                throw new Error("Code has expired. Please request again.");
            } else {
                const validOTP = await bcrypt.compare(otpcode, hashedOTP);
                if (!validOTP) {
                    // supplied otp is wrong
                    throw new Error("Invalid code passed. Check your inbox.");
                } else {
                    // success
                    await User.updateOne({ _id: userId }, { verified: true });
                    await Otp.deleteMany({ otpId });
                }
            }
        }
    }
    res.json({
        message: "User Verified",
        userId
    })
}