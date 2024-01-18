import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js"
import {Users} from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js" 
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await Users.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await Users.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await Users.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await Users.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email, username, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await Users.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await Users.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logOutUser=asyncHandler(async(req,res)=>{
    await Users.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1,
        }
    },{
        new:true,
    })

    const options={
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"user logged out successfully")
    )
})

const RefreshAccessToken=asyncHandler(async(req,res)=>{
    try {
        const incomingRefreshToken=await req.cookies.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
            throw new ApiError(402,"Refresh Token is not available")
        }

        const decodedToken=jwt.verify(incomingRefreshToken,REFRESH_TOKEN_SECRET)

        if(!decodedToken){
            throw new ApiError(402,"Problem with decoded Token")
        }

        const user=await Users.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(400,"No user exists with that ID")
        }

        if(user?.refreshToken!==incomingRefreshToken){
            throw new ApiError(402,"Refresh Token is Expired or used")
        }

        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(decodedToken._id)

        const options={
            httpOnly:true,
            secure:true
        }

        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("New Refresh Token",newRefreshToken,options)
        .json(new ApiResponse(200,{
            accessToken,refreshToken:newRefreshToken
        }),
        "New Tokens Generated Successfully")
    } catch (error) {
        throw new ApiError(400,error.message || "Unauthorized access")   
    }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {currentPassword,newPassword,confirmNewPassword}=req.body

    if(
        [currentPassword,newPassword,confirmNewPassword].some((fields)=>fields.trims()==="")
    ){
        throw new ApiError(400,"All Fields are required")
    }    

    const user=await Users.findById(req?.user?._id)
    const isPasswordCorrect=await isPasswordCorrect(currentPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Current Password is not Corect")
    }

    if(newPassword!==confirmNewPassword){
        throw new ApiError(400,"New Password and Confirm Password does not match")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,{},"Password is set successfully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
    res.status(200)
    .json(new ApiResponse(200,req?.user,"Current user data fetched successfully"))
})

const updateUserProfile=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!fullName || !email){
        throw new ApiError(400,"FullName and email is required")
    }

    const user=await Users.findByIdAndUpdate(req?.user?._id,
        {
            $set:
            {
                fullName:fullName,
                email:email
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse
        (200,
            user,
            "User Profile Updated Successfully"
        )
    )
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=await req?.file?.avatar[0].path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File Path Not Available")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar File Upload on cloudinary failed")
    }

    const user=await Users.findById(req?.user?._id,{
        $set:{
            avatar:avatar?.url
        },
    },{
        new:true
    }).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"User Avatar Updated Successfully"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const CoverImageLocalPath=await req?.file?.avatar[0].path
    if(!CoverImageLocalPath){
        throw new ApiError(400,"CoverImage File Path Not Available")
    }

    const coverImage=await uploadOnCloudinary(CoverImageLocalPath)

    if(!coverImage){
        throw new ApiError(400,"CoverImage File Upload on cloudinary failed")
    }

    const user=await Users.findById(req?.user?._id,{
        $set:{
            coverImage:coverImage?.url
        },
    },{
        new:true
    }).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"User CoverImage Updated Successfully"))
})

export {registerUser,loginUser,logOutUser,RefreshAccessToken,changeCurrentPassword,getCurrentUser,updateUserProfile,updateUserAvatar,updateUserCoverImage}