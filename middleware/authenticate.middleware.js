const jwt=require("jsonwebtoken")
require('dotenv').config()

const authenticate=(req,res,next)=>{
    let token=req.headers.authorization?.split(" ")[1]
    if(!token){
        res.status(401).send({"Message":"Please Login again"})
    }else{
        let decoded=jwt.verify(token,process.env.seckey)
        if(decoded){
            let userID=decoded.userID
            req.body.userID=userID
            next()
        }else{
            res.status(401).send({"Message":"Please Login again"})
        }
    }
}

module.exports={
    authenticate
}