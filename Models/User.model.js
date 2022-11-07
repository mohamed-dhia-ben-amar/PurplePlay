import mongoose, { mongo } from 'mongoose';
const { Schema, model} = mongoose

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        password : {
            type: String,
            required: true
        },
        mail : {
            type: String,
            required: true
        },
        image : {
            type: String,
            required: true
        },
        role : {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default model ("user", userSchema)