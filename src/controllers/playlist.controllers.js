import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


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
    Playlist.aggregate([{
        $match:{
            _id:playlistId,
            
        }
    }])
    const playlistData=await Playlist.findById(playlistId)
    res.status(200).json(new ApiResponse(200,"playlist found by ID",playlistData))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params



})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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