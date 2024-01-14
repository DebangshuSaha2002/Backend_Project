import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"   
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET, 
});

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        console.log("File Successfully uploaded on Cloudinary ",response.url)
        return response
    } catch (error) {
        fs.unlink(localFilePath)
        console.log("There is some prob with the localFilePath")
        return null
    }
}






cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });