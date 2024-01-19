import { Router } from "express";
import { 
    registerUser,
    loginUser,
    logOutUser,
    RefreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserProfile,
    updateUserAvatar,
    updateUserCoverImage,
    getUserProfileData,
    getWatchHistory,
} from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
const router=Router()

router.route("/register").post(
  upload.fields([
      {
          name: "avatar",
          maxCount: 1
      }, 
      {
          name: "coverImage",
          maxCount: 1
      }
  ]),
  registerUser
  )

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logOutUser)

router.route("/refresh-token").post(RefreshAccessToken)

router.route("/password-change").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/user-profile").patch(verifyJWT,updateUserProfile)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/profile-data/:username").get(verifyJWT,getUserProfileData),

router.route("/watch-history").get(verifyJWT,getWatchHistory)
export default router