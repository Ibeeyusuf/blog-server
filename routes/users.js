import express from "express";
const router = express.Router();
import {User, validate} from '../models/user.js';
import bcrypt from "bcryptjs";


router.post("/", async (req, res) => {
  try{
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });

    if(user) {
      return res.status(409).send({ message: "User with given email already exists!" })
    } 
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    
    await new User({ ...req.body, password: hashPassword }).save();
    res.status(201).send({ message: "User created successfully" });
  } catch(error){
    res.status(500).send({ message: "Internal Server Error" });
  }
})

export default router;
// const userRouter = express.Router();


// userRouter.get("/users",async (req,res,next) => {
//     try {
//         const users = await User.find();
//         return res.status(200).send(users);
//     } catch (error) {
//         next(error);
//     }
// });

// userRouter.post("/users",async (req,res,next) => {
//     try{
//         const { text,category } = req.body;
//     } catch(error){
//         next(error);
//     }
// })

// export default userRouter;