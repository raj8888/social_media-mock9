const express=require("express")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const {authenticate}=require("../middleware/authenticate.middleware")
require('dotenv').config()
const {userModel}=require("../models/users.model")
let userRouter=express.Router()


userRouter.post("/register",async(req,res)=>{
    try {
       let data=req.body
       let email=data.email
       let findEmail=await userModel.findOne({email})
       if(findEmail){
        res.status(401).send({"Message":"User already registered"})
       }else{
        bcrypt.hash(data.password, 5, async(err, hash)=>{
            if(err){
                console.log(err.message)
                res.status(401).send({"Message":"Try Again"})
            }else{
                data.password=hash
                const user=new userModel(data)
                await user.save()
                res.status(201).send({"Message":"User Register Successfully"})
            }
        });
       } 
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

userRouter.post("/login",async(req,res)=>{
    try{
       let data=req.body
       let email=data.email
       let findEmail=await userModel.findOne({email})
       if(findEmail){
        let hashpass=findEmail.password
        bcrypt.compare(data.password,hashpass,async(err,result)=>{
            if(err){
                console.log(err.message)
                res.status(401).send({"Message":"Please Enter correct credentials"})
            }else if(result){
                let token=jwt.sign({userID:findEmail._id},process.env.seckey)
                res.status(201).send({"Message":"User Login Successfully","token":token})
            }else{
                res.status(401).send({"Message":"Please Enter correct credentials"})
            }
        })
       }else{
        res.status(401).send({"Message":"Please Register First"})
       } 
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

userRouter.use(authenticate)

userRouter.get("/users",async(req,res)=>{
    try {
        
        let data=await userModel.find()
        let allData=data.map(elem=>{
            let obj={}
            obj.email=elem.email
            obj.name=elem.name
            return obj
        })
        res.status(200).send({"AllUsers":allData})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"}) 
    }
})

userRouter.get("/:id/friends",async(req,res)=>{
    try {
        let id=req.params.id
        let data=await userModel.findById({_id:id})
        let friendlist=data.friends
        let arr=[]
        for(let i=0;i<friendlist.length;i++){
            let temp=await userModel.findById({_id:friendlist[i].id})
            let obj={
                name:temp.name
            }
            arr.push(obj)
        }
        res.status(200).send({"AllUsers":arr})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})  
    }
})

userRouter.post("/:id/friends",async(req,res)=>{
    try {
        let id=req.params.id
        let frID=req.body.id
        let frData=await userModel.findById({_id:frID})
        let obj={
            id:id,
            req:false
        }
        frData.friendRequests.push(obj)
        await frData.save()
        res.status(201).send({"Message":"Friend Request Send Successfully"})
    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})  
    }
})

userRouter.patch("/:id/friends/:friendid",async(req,res)=>{
    try {
        let id=req.params.id
        let frID=req.params.friendid
        let flag=req.body.request
        let data=await userModel.findById({_id:id})
        let FrReqList=data.friendRequests
        let friendsList=data.friends
        let temp=FrReqList.filter(elem=>{
            if(elem.id==frID){
                return elem
            }
        })
        if(temp.length==0){
            res.status(201).send({"Message":"He is not in your friend request list"})
        }else{
            if(flag==false){
                let newReqList=FrReqList.filter(elem=>{
                    if(elem.id!=frID){
                        return elem
                    }
                })
                await userModel.findByIdAndUpdate({_id:id},{friendRequests:newReqList||[]})
                res.status(201).send({"Message":"Friend Request rejected"})
            }else if(flag ==true){
                let newReqList=FrReqList.filter(elem=>{
                    if(elem.id==frID){
                        elem.req=true
                        return elem
                    }
                })
                let newReqListabc=FrReqList.filter(elem=>{
                    if(elem.id!=frID){
                        return elem
                    }
                })
                await userModel.findByIdAndUpdate({_id:id},{friendRequests:newReqListabc||[]})
                let abc=newReqList[0]
                data.friends.push(abc)
                await data.save()
                res.status(201).send({"Message":"Friend Request accepted"})
            }
        }

    } catch (error) {
        console.log(error.message)
        res.status(401).send({"Message":"Server Error"})
    }
})

module.exports={
    userRouter
}