const cors = require("cors");
require("dotenv").config();
const cookieparser = require("cookie-parser");
const express = require("express");
const connectDB = require("./config/connectDB");
const authRouter = require("./routes/authRouter");
const app = express()


const coroptions = {
    credentials: true,
    origin: 'http://localhost:5173'
}


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieparser())
app.use(cors(coroptions))

app.get("/", (req,res)=>{
    res.send("<h1>Welcome Home</h1>")
})

app.use("/api/auth", authRouter)


connectDB();
app.listen(5000, ()=>{
    console.log('Listening on http://localhost:5000')
})
