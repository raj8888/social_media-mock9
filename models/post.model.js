const mongoose=require("mongoose")

let postSchema=mongoose.Schema({
    userID:String,
    text: String,
    image: String,
    createdAt: Date,
    likes: [],
    comments: []
})

let postModel=mongoose.model("posts",postSchema)

module.exports={
    postModel
}