import mongoose, { mongo } from 'mongoose';
const { Schema, model } = mongoose

const userSchema = new Schema(
    {
        username: {
            type: String,
            minlength: 4,
            maxlength: 200,
            required: [true, "Username Required"]
        },
        password: {
            type: String,
            required: [true, "Password Required"],
        },
        mail: {
            type: String,
            validate: {
                validator: async function (mail) {
                    const user = await this.constructor.findOne({ mail });
                    if (user) {
                        if (this.id === user.id) {
                            return true;
                        }
                        return false;
                    }
                    return true;
                },
                message: props => 'The specified email address is already in use.'
            },
            required: [true, 'User email required']
        },
        image: {
            type: String,
            required: [true, 'Image required']
        },
        role: {
            type: String,
            required: [true, 'Role required'],
            enum: ["Admin", "User"]
        },
        verified: {
            type: Boolean
        }
    },
    {
        timestamps: true
    }
);

export default model("user", userSchema)