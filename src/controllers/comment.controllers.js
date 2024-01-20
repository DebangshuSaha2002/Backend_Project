import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import Comment from "../models/comment.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400,"Video Id is required to get video comments")
    }

    const commentAggregatedData=await Comment.aggregate([
        {
            $match:{
                video:mongoose.Types.ObjectId(videoId)
            }
        },{
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                        $addFields:{
                            TotalVideoCommentData:{
                                $first:"$video"
                            }
                        }
                    }
                ]
            }
        },{
            $project:{
                title:1,
                content:1,
            }
        }
    ])

    if(!commentAggregatedData){
        throw new ApiError(404,"Video not found-issue with videoID")
    }

    res.status(200).json(new ApiResponse(200,"Video Comments",commentAggregatedData))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params
    const {content}=req.body

    if(!videoId){
        throw new ApiError(400,"Video Id is required to add comment")
    }

    if(!content){
        throw new ApiError(400,"Comment content is required to add comment")
    }

    const comment=await Comment.create({
        content:content,
        video:mongoose.Types.ObjectId(videoId),
        owner:req.user._id
    })

    if(!comment){
        throw new ApiError(500,"Problem with adding Comment")
    }

    res.status(200).json(new ApiResponse(200,"Comment Added Successfully",comment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params
    const {content}=req.body

    if(!commentId){
        throw new ApiError(400,"comment ID is required to update comment")
    }

    if(!content){
        throw new ApiError(400,"Comment content is required to update the comment")
    }

    const commentData=await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content:content
        }
    },{
        new:true
    })

    res.status(200).json(new ApiResponse(200,"Comment Updated Successfully",commentData))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params

    if(!commentId){
        throw new ApiError(400,"Comment ID is required to delete comment")
    }

    const comment=await Comment.findByIdAndDelete(commentId)
    res.status(200).json(new ApiResponse(200,"Comment Delete Successfully",comment))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }