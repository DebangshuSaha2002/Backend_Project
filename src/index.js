// require('dotenv').config({path:".env"});
import dbConnect from './db/dbase.js';
import dotenv from "dotenv";

dotenv.config({
    path:'./env'
})

dbConnect();