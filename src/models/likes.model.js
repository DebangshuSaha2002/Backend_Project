import mongoose,{Schema} from "mongoose";

const likeSchema=new Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"comment",
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"video",
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"tweets",
    }
},{timestamps:true})

export const Like=model("Like",likeSchema)