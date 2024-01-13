// require('dotenv').config({path:".env"});
import dbConnect from './db/dbase.js';
import dotenv from "dotenv";
import app from "./app.js"
dotenv.config({
    path:'./env'
})

dbConnect()
.then(()=>app.listen(process.env.PORT||8000,()=>{
    console.log(`Server is running at PORT ${process.env.PORT}`);
}))
.catch((err)=>console.log("Error",err));