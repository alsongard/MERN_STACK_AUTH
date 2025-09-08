const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username:{type:String, required:true },
    email: {type:String, required:true, unique:true},
    password:{type:String, required:true},
    isAccountVerified: {type:Boolean, default:false},
    verifyOtp: {type:String, default:''},
    verifyOtpExpiresIn:{type:Number, default:0 },
    resetOtp: {type:String, default:''},
    resetOtpExpiresIn: {type:Number, default:0}
})

const User = mongoose.model('User', UserSchebma);
module.exports = User; 

// 0768676929