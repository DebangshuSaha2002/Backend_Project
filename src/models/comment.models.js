import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const commentSchema = new Schema({
    content:{
        type:String,
        required:true,
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Comment=model("Comment",commentSchema)