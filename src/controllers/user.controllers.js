import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js"
import {Users} from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js" 
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
    //Take the data from the form
    //check for validity of the data
    //check whether user already exists - username and email
    //upload the avatar to cloudinary
    //check for the upload of the avatar
    //also take cover Image - Not necessary
    //create user object and upload in db
    //check for the user creation
    //remove the password and the refresh Token from the response

    const {fullName,email,password,username}=req.body
    if(
        [fullName,email,password,username].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All Fields are required")
    }

    const existedUser=Users.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Username and Email Already exists")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar Local Path Not Available")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Something went wrong while uploading avatar to cloudinary")
    }

    const user=await Users.create({
        fullName,
        username:username.toLowerCase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
    })

    const createdUser=await Users.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while placing new user entry in db")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered successfully")
    )
})

export {registerUser}