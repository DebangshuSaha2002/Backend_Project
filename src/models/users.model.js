import mongoose,{Schema, model} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema=new Schema({
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
    },
    avatar:{
        type:String, //Cloudinary Url
        required:true,
    },
    coverImage:{
        type:String, ////Cloudinary Url
    },
    password:{
        type:String,
        required:[true,'Password is Required'],
    },
    refreshToken:{
        type:String,
    },
},{timestamps:true})

//encrypting the password
userSchema.pre("save",async function(next){
    if(this.isModified("password")) return next()

    this.password=await bcrypt.hash(this.password,10),
    next()
})

//checking if password is correct
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare("password",this.password)
}

userSchema.methods.generateAccessToken=function(){
    jwt.sign({
        _id:this._id,
        fullName:this.fullName,
        email:this.email,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
    })
}

userSchema.methods.generateRefreshToken=function(){
    jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
    })
}

export const Users=model("Users",userSchema)