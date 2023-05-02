const express=require("express")
const{connection}=require("./config/db")
const{userRouter}=require("./routes/user.route")
const{postRouter}=require("./routes/post.route")
require('dotenv').config()

const app=express()

app.use(express.json())

app.use("/users",userRouter)
app.use("/posts",postRouter)


app.get("/",(req,res)=>{
    res.send("HOME PAGE")
})


app.listen(process.env.port,async()=>{
    try {
        await connection
        console.log("Connected to DB")
    } catch (error) {
        console.log(error.message)
    }
    console.log(`Server is listning on ${process.env.port}`)
})