import mongoose,{Schema} from "mongoose";

const subscriptionSchema=new Schema({
    subscriber:{ 
        type:Schema.Types.ObjectId, //One who is subscribing
        ref:"Users"
    },
    channel:{
        type:Schema.Types.ObjectId, //One who is being subscribed by the subscriber
        ref:"Users"
    }
},{timestamps:true})

export const Subscription=model("Subscription",subscriptionSchema)