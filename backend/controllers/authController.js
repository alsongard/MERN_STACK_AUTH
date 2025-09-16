// this file is used for registration, login functions/process
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const transporter = require("./nodemailer");
const crypto = require("crypto");



const genSalt = 10;
module.exports.Registration = async (req, res)=>{
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

        // WELCOMING EMAIL:: THOUGH NOT NECESSARY
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

module.exports.Login = async (req, res)=>{
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

module.exports.Logout = async (req, res)=>{
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
        console.log(`Error: ${err}`)
        return req.status(500).json({success:false, msg:`Error: ${err.message}`});
    }
}


module.exports.sendVerifyOtpToEmail = async (req, res)=>{
    try
    {
        const {userId} = req.body;
        if (!userId)
        {
            return res.status(400).json({success:false, msg:"No user_id given"});
        }

        // check if userId exists
        const foundUser = await User.findOne({_id: userId});
        if (!foundUser)
        {
            return res.status(404).json({success:false, msg:`User id ${userId} not found!`})
        }
        
        if(foundUser.isAccountVerified)
        {
           return res.status(409).json({success:false, msg: `User with id : ${userId} verified`}) 
        }
        Math.floor(Math.random()*10)
        // const otpp = Math.floor(100000+Math.random()*900000);
        const otp =  crypto.randomInt(100000,1000000)
        console.log(`this is otp: ${otp}`);
        // foundUser.isAccountVerified = true;

        foundUser.verifyOtp =otp;
        // const new_date  = Date.now() + 24 * 60 * 60 * 1000;
        foundUser.verifyOtpExpiresIn = Date.now() + 10 * 60 * 1000;
        await foundUser.save();


        // after creating the otp we need to send it to the useremail
        const mailOptions = {
            from: process.env.SMPT_SENDER_EMAIL,
            to: userEmail,
            subject:"Account Verification OTP",
            body: `Your account verification otp is ${otp}`
        }

        await transporter.sendMail(mailOptions);
        console.log(info);

        res.json({success:true, msg:'Verfication otp sent to email'})

    }
    catch(err)
    {
        console.log(`Error: ${err}`);
        return res.status(500).json({success:false, msg:`Error: ${err}`})

    }
}
// after sending welcome email registration
// send otp to user
// now we verify otp that is going to be entered from the front-end




module.exports.verifyEmailAccount = async (req,res)=>{
    const {userOtp,  userId} = req.body;
    if (!userOtp || !userId)
    {
        return res.status(400).json({success:false, msg:"Invalid Input"})
    }

    try
    {

    }
    catch(err)
    {
        console.log(`Error: ${err}`);
        return res.status(500).json({success:false, msg:`Error: ${err}`})
    }
    //compare values
    // find user by email
    const foundUser = await User.findOne({_id: userId});
    if (!foundUser)
    {
        return res.status(404).json({success:false, msg:"User not found!"})
    }
    // we need to check timer
    if (Date.now() >= foundUser.verifyOtpExpiresIn)
    {
        return res.json({success:true, msg: "Verification OTP expires in 10 minutes try again!"})
    }
    if (foundUser.verifyOtp === '' || foundUser.verifyOtp !== userOtp)
    {
        return res.status(400).json({success:false, msg:'Invalid OTP'})
    }
    // in the above if all checks are true now the user is verified: otp is correct

    // change isAccountVerified to true
    foundUser.isAccountVerified = true;
    // change verifyOpt and verifyOtpExpires
    foundUser.verifyOtp = '';
    foundUser.verifyOtpExpiresIn = 0;
    await foundUser.save();


    return res.status(200).json({success:true, msg:"User Email has been verified"})
 }