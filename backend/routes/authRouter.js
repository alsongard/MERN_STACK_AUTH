const express = require("express");
const {AuthenticateVerify} = require("../middleware/auth")
const {Login, Logout, Registration, verifyEmailAccount, sendVerifyOtp} = require("../controllers/authController");
const authRouter = express.Router();


authRouter.post("/login",AuthenticateVerify, Login );
authRouter.post("/register", Registration);
authRouter.post("/logout", Logout);
authRouter.post("/send-otp", AuthenticateVerify, sendVerifyOtp)
authRouter.post("/verify-email", AuthenticateVerify,  verifyEmailAccount);


module.exports = authRouter;



