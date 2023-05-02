const express=require("express")
const {authenticate}=require("../middleware/authenticate.middleware")
require('dotenv').config()
const {userModel}=require("../models/users.model")
const {postModel}=require("../models/post.model")
let postRouter=express.Router()
postRouter.use(authenticate)


postRouter.get("/",async(req,res)=>{
    try {
        let allData=await postModel.find()
        res.status(200).send({"AllPosts":allData})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})


postRouter.post("/",async(req,res)=>{
    try {
        let userid=req.body.userID
        let userData=await userModel.findById({_id:userid})
        let payload=req.body
        payload.userID=userid
        payload.createdAt=new Date()
        const post=new postModel(payload)
        await post.save()
        let obj={
            userID:userid,
            postID:post._id
        }
        userData.posts.push(obj)
        await userData.save()
        res.status(201).send({"Message":"Post added Successfully"})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

postRouter.patch("/:id",async(req,res)=>{
    try {
        let id=req.params.id
        let payload=req.body
        await postModel.findByIdAndUpdate({_id:id},payload)
        res.status(201).send({"Message":"Post Updated Successfully"})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

postRouter.delete("/:id",async(req,res)=>{
    try {
        let id=req.params.id
        let userID=req.body.userID
        await postModel.findByIdAndDelete({_id:id})
        let data=await userModel.findById({_id:userID})
        let allPost=data.posts
        let newpost=allPost.filter(elem=>{
            if(elem.postID!=id){
                return elem
            }
        })
        await userModel.findByIdAndUpdate({_id:userID},{posts:newpost})
        res.status(202).send({"Message":"Post Deleted Successfully"})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

postRouter.post("/:id/like",async(req,res)=>{
    try {
        let id=req.params.id
        let userID=req.body.userID
        let postData=await postModel.findById({_id:id})
        let postAr=postData.likes
        let temp=postAr.filter(elem=>{
            if(elem.userID==userID){
                return elem
            }
        })
        if(temp.length>0){
            res.status(201).send({"Message":"You already liked this post"})
        }else{
            let obj={
                userID:userID,
                like:true
            }
            postData.likes.push(obj)
            await postData.save()
            res.status(201).send({"Message":"Post Liked"})
        }
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

postRouter.post("/:id/comment",async(req,res)=>{
    try {
        let id=req.params.id
        let userID=req.body.userID
        let payload=req.body.comment
        let postData=await postModel.findById({_id:id})
        let obj={
                userID:userID,
                comment:payload
        }
        postData.comments.push(obj)
         await postData.save()
        res.status(201).send({"Message":"Commented on the post"})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

postRouter.get("/:id",async(req,res)=>{
    try {
      let postID=req.params.id
      let postData= await postModel.findById({_id:postID})  
      res.status(202).send({"post":postData})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

module.exports={
    postRouter
}

