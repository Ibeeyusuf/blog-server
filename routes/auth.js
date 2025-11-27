import express from "express";
import joi from "joi";
import bcrypt from "bcrypt";
import User from "../models/user.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const{error}= validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });
        
        const userAlreadyExit = await User.findOne({ email: req.body.email });
        if(userAlreadyExit) return res.status(400).send({ message: "User already registered" });
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            firstName: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        const savedUser = await user.save();
        const token = savedUser.generateAuthToken();
        res.status(201).send({ data: token, message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });   
    }
})

router.post("/login", async (req, res) => {
    try{
        const{error}= validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if(!user)
            return res.status(401).send({ message: "Invalid Email or Password" });
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if(!validPassword)
                return res.status(401).send({ message: "Invalid Email or Password" });
            const token = user.generateAuthToken();
            user.password = undefined;
            res.status(200).send({ user,data: token, message: "Logged in successfully" });
        }
    catch(error){
        res.status(500).send({ message: "Internal Server Error" });
    }
})

const validate = (data)=> { 
    const schema = joi.object({
        name: joi.string().label("Full Name"),
        email: joi.string().email().required().label("Email"),
        password: joi.string().min(6).required().label("Password"),
    });
    return schema.validate(data);
}

export default router;