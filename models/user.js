import mongoose from "mongoose";
import joi from "joi";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
},);

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '10h' });
        return token;};

export const User = mongoose.model('User', userSchema);

export const validate = (data)=> {
    const schema = joi.object({
        name: joi.string().required().label("Full Name"),
        email: joi.string().email().required().label("Email"),
        password: joi.string().min(6).required().label("Password"),
    });
    return schema.validate(data);
}

export default User;