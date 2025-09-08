const mongoose = require("mongoose");

const connectDB = async ()=>{
    try
    {
        // console.log(process.env.MONGO_URI); // testing:working
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Successfully connected to MONGODB`);
    }
    catch(err)
    {
        console.log(`Error: ${err}`);
    }
}

module.exports = connectDB;