import mongoose, { mongo } from 'mongoose';
const { Schema, model } = mongoose

const otpSchema = new Schema({
    user: String,
    code: String,
    createdAt: Date,
    expiresAt: Date
});

export default model("otp", otpSchema)