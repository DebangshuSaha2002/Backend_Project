import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import Video from "../models/video.model.js"
import fs from "fs"   

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(
        [name,description].some((field)=>!field.trim()=="")
    ){
        throw new ApiError(400,"Name and description required")
    }

    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    return res.status(201)
    .json(new ApiResponse(201,"Playlist Created",playlist))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(400,"User Id is required to get user Playlists")
    }

    const userPlaylists=await mongoose.Aggregate([
        {
            $match:{
                owner:userId
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"playlist"
            }
        },
    ])

    if(!userPlaylists){
        throw new ApiError(404,"User not registered")
    }

    res.status(200).json(new ApiResponse(200,"User Playlists",userPlaylists))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const {userId}=req.params
    Playlist.aggregate([
        {
            $match:{
                _id:playlistId,
                owner:userId
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"_id",
                as:"playlistVideos"
            }
        },
        {
            $project:{
                name:1,
                description:1,
                videos:1,
                owner:1
            }
        },
    ])
    const playlistData=await Playlist.findById(playlistId)
    res.status(200).json(new ApiResponse(200,"playlist found by ID",playlistData))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(
        [playlistId,videoId].some((field)=>!field.trim()=="")
    ){
        throw new ApiError(400,"Playlist ID and Video ID required")
    }

    const videoData=await Video.findById(videoId)

    if(!videoData){
        throw new ApiError(404,"No such Video exits with that video ID")
    }

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"No such playlist exits with that playlist ID")
    }

    const videoUrl=await videoData.videoFile

    const AddingVideoToPlaylist=await Playlist.findById(playlistId,{
        $set:{
            videos:videoUrl
        }
    })

    if(!AddingVideoToPlaylist){
        throw new ApiError(500,"Error while adding video to playlist")
    }

    res.status(200).json(new ApiResponse(200,"Video added to playlist",AddingVideoToPlaylist))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(
        [playlistId,videoId].some((field)=>!field.trim()=="")
    ){
        throw new ApiError(400,"Playlist ID and Video ID required")
    }
    
    const videoData=await Video.findById(videoId)

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video ID")
    }

    if(!videoData){
        throw new ApiError(404,"No such Video exits with that video ID")
    }

    if(!playlistId){
        throw new ApiError(400,"Playlist ID is required")
    }

    const VideoInPlaylist=await Playlist.aggregate([{
        $match:{
            videos:videoId,
        }
    }])

    if(!VideoInPlaylist){
        throw new ApiError(404,"Video not found in playlist")
    }

    try {
        const videoUrl=await VideoInPlaylist.videos
        if(!videoUrl){
            throw new ApiError(404,"Video URL not found")
        }
        fs.unlinkSync(videoUrl)

    } catch (error) {
        throw new ApiError(500,"Error while removing video from playlist")
    }
})  

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"Playlist ID is required")
    }

    const playlistData=await Playlist.findById(playlistId)

    if(!playlistData){
        throw new ApiError(404,"Playlist not found with this playlist ID")
    }

    const removingPlaylist=await Playlist.findByIdAndDelete(playlistId)
    if(!removingPlaylist){
        throw new ApiError(500,"Error while removing playlist")
    }

    res.status(200).json(new ApiResponse(200,"Playlist removed successfully",removingPlaylist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId){
        throw new ApiError(400,"Playlist ID is required")
    }

    if(
        [name,description].some((field)=>!field.trim()=="")
    ){
        throw new ApiError(400,"Name and description required")
    }

    const playListUpdated=await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name:name,
            description:description,
        }
    },{
        new:true,
    })

    if(!playListUpdated){
        throw new ApiError(500,"Error while updating playlist")
    }

    res.status(200).json(new ApiResponse(200,"Playlist Updated Successfully",playListUpdated))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}