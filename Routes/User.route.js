import Express from "express";

import * as UserController from '../Controllers/User.controller.js'

import multer from '../Middleware/multer-config.js';

import Otp from '../Models/OTPVerif.model.js'

import User from '../Models/User.model.js';

import bcrypt from 'bcryptjs';

const router = Express.Router()

router.route('/register')
    .post(multer, UserController.register)

router.route('/login')
    .post(UserController.login)

// Verify otp email
router.post("/verifyOTP", async (req, res) => {
    try {
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
    } catch (error) {

    }
});


export default router