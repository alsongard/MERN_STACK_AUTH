const jwt = require("jsonwebtoken");


module.exports.AuthenticateVerify = async (req,res,next)=>{
    // get the id from the cokkie 
    console.log("request cookies")
    console.log(req.cookies);
    const {authCookie} = req.cookies; // from res.cookies you get the cookie with the name: authCookie
    
    console.log("This is authCookie")
    console.log(authCookie);
    
    if (!authCookie)
    {
        return res.status(400).json({success:false, msg:"Invalid cookie"});
    }

    try
    {
        const resultVerify = jwt.verify(authCookie, process.env.JWT_TOKEN_SCRT);
        console.log("this is resultVerify");
        console.log(resultVerify);

        if (!resultVerify.id)
        {
            console.log(`Error:ivalid token`);
            return res.status(400).json({success:false, msg: "Invalid token"})
        }
        req.userId = resultVerify.id;
        next();
    }


    catch(err)
    {
        return res.json({success:false, msg:`Error: ${err}`})
    }


}