const mongoose=require("mongoose")

let userSchema=mongoose.Schema({
  name: String,
  email: String,
  password: String,
  dob: String,
  bio: String,
  posts: [],
  friends: [],
  friendRequests: []
})

let userModel=mongoose.model("users",userSchema)

module.exports={
    userModel
}