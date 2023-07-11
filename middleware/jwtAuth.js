const { StatusCodes,ReasonPhrases } = require("http-status-codes");
const customError = require("../errors/custom-error");
const async_wrapper = require("./async_wrapper");
const USER = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = async_wrapper(async(req,res,next)=>{
    //console.log(req);
    const {token} = req.cookies;
    console.log(req.cookies);
    if(token == null || token==undefined){
        throw new customError("signin",StatusCodes.FORBIDDEN);
    }
    //try{
        const user = jwt.verify(token,process.env.JWT_SECRET);
    // }catch(err){
    //     throw new customError("sign in",StatusCodes.FORBIDDEN);
    // }
    console.log(user);
    const ValidUser = await USER.findOne({email:user.email});
    if(!ValidUser){
        throw new customError("sigin",StatusCodes.FORBIDDEN);
    }
    req.user = user;
    next(); 
})

module.exports = authenticateToken;