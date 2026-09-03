const userModel =require("../models/user.model")
const jwt = require('jsonwebtoken')
const emailService = require("../services/email.service")
const tokenBlacklistModel = require("../models/blacklist.model")

/** 
* - user register controller 
* - POST /api/auth/register
*/
async function userRegisterController(req, res) {
    const { email, password, name } = req.body;

    const isExists = await userModel.findOne({
        email: email
    });

    if (isExists) {
        return res.status(422).json({
            message: "User Already Exist with email.",
            status: "failed"
        });
    }

    const user = await userModel.create({
        email,
        password,
        name
    });

    // Send registration email
    await emailService.sendRegistrationEmail(
        user.email,
        user.name
    );

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        {
            expiresIn: "3d"
        }
    );

    res.cookie("token", token);

    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            systemUser: user.systemUser
        },
        token
    });
}

/** 
* - user login controller 
* - POST /api/auth/login
*/
async function userLoginController(req,res){
    const{email,password} = req.body
    
    const user = await userModel.findOne({email}).select("+password +systemUser")

    if(!user){
        return res.status(401).json({
            message:"Email or password is INVALID"
        })
    }
   const isValidPassword= await user.comparePassword(password)

   if(!isValidPassword){
    return res.status(401).json({
            message:"Email or password is INVALID"
        })
    }

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{
    expiresIn:"3d" })

    res.cookie("token",token)

    res.status(200).json({
    user : {
        _id:user._id,
        email:user.email,
        name:user.name,
        systemUser:user.systemUser
    },
    token
})

    
}

async function userLogoutController(req, res) {
    const expiresAt = new Date(req.decodedToken.exp * 1000);

    await tokenBlacklistModel.updateOne(
        { token: req.token },
        { token: req.token, expiresAt },
        { upsert: true }
    );

    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}