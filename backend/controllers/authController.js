// this file is used for registration, login functions/process
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const transporter = require("./nodemailer")


const genSalt = 10;
exports.Registration = async (req, res)=>{
    const {userName, userEmail, userPassword } = req.body;
    console.log(`userName:${userName}\nuserEmail:${userEmail}\nuserPassword:${userPassword}`)
    try
    {
        if (!userName || !userPassword || !userEmail)
        {
            return res.json({success:false, msg:'Invalid Input'});
        }

        // check if the user Exists
        const checkUserName = await User.findOne({email:userEmail});
        const checkUserEmail = await User.findOne({user:userName});
  
        if (checkUserName)
        {
            return res.json({success:false, msg:'Username already exist '})
        }
        if (checkUserEmail)
        {
            return res.json({success:false, msg:'Email already exists'});
        }
        const passHash = await bcrypt.hash(userPassword, genSalt);
        const new_user = await User.create({username:userName, email:userEmail,  password:passHash});

        const mailOptions = {
            from: process.env.SMPT_SENDER_EMAIL,
            to: userEmail,
            subject:"Welcome to MernAuth",
            text: `Welcome to MernAuth Website YOur email has been created with ${new_user._id}`
        }
	
        const info = await transporter.sendMail(mailOptions);
        console.log('this is info:')
        console.log(info);
        if (new_user)
        {
            res.status(200).json({success:true, msg:"User Successfully Created"})
        }

    }
    catch(err)
    {
        console.log(`Error: ${err}`);
        return res.status(500).json({success:false, msg:`Error: ${err.message}`});

    }
    
}

exports.Login = async (req, res)=>{
    const {userEmail, userPassword} = req.body;
    if (!userEmail || !userPassword)
    {
        return res.status(400).json({success:false, msg:"Invalid Input"})
    }
    
    try
    {
        // check if the email exist
        const foundUser = await User.findOne({email:userEmail});
        if (!foundUser)
        {
            return res.status(404).json({success:false, msg:'Invalid Credentials'});
        }

        const result = bcrypt.compare(userPassword, foundUser.password);
        if (!result) // yes
        {
            return res.status(401).json({success:false, msg:"Invalid Password"});
        }

        const token = jwt.sign({id:foundUser._id}, process.env.JWT_TOKEN_SCRT, {expiresIn: '40m'});
        res.cookie('authCookie', token, {
            httpOnly: true, 
            secure: true, // only sent over HTTPS
            sameSite: 'strict',  // prevents CSRF(cross script resource forgery)
            maxAge: 1000 * 60 * 60 // hour
        });

        return res.status(200).json({success:true, token:token,  data:foundUser});

    }
    catch(err)
    {
        console.log(`Error: ${err}`);
        return res.status(500).json({success:false, msg:`Error: ${err.message}`});

    }
}

exports.Logout = async (req, res)=>{
    try
    {
        res.clearCookie('authCookie', {
            httpOnly: true, 
            sameSite: true, 
            secure: 'strict'
        })
        return res.status(200).json({success:true, msg:"Cookies cleared"});
    }
    catch(err)
    {
        return req.status(500).json({success:false, msg:`Error: ${err.message}`});
        console.log(`Error: ${err}`)
    }
}
