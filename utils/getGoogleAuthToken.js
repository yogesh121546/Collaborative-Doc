const async_wrapper = require("../middleware/async_wrapper");
const USER = require('../models/user');
const generateJwtToken = require("../utils/generateJWT");
const axios = require('axios');
require('dotenv').config();



const getToken = async_wrapper(async (req,res)=>{

    console.log({authorisationCode: req.query.code});

        const url = "https://oauth2.googleapis.com/token";
        const values = {
          code:req.query.code,
          client_id: process.env.googleClientId,
          client_secret: process.env.googleClientSecret,
          redirect_uri: `${process.env.redirect_uri}/google/auth/callback`, 
          grant_type: "authorization_code",
        };
        const qs = new URLSearchParams(values);
        console.log(qs.toString());  
        const {id_token,access_token} = await 
        axios
        .post(url, qs.toString(), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then((res) => (res.data))
        .catch((error) => { 
          console.error(`Failed to fetch auth tokens`);
          throw new Error(error.message);
        });

        console.log({id_token:id_token,access_token:access_token});
//
        const googleUser = await 
        axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${id_token}`,
                },
            }
        )
        .then((res) => res.data)
        .catch((error) => {
        console.error(`Failed to fetch user`);
        throw new Error(error.message);
        });
    console.log(googleUser);
    //check if user exists in database
    const User = {
        email:googleUser.email
    }
    const userExist = await USER.findOne({email:googleUser.email});
    const token = generateJwtToken(User);
    if(userExist){
        return res.cookie('token',token).json({msg: "successful login and jwt token sent"});
    }
    USER.create(User)
    .then(res.cookie('token',token).json({msg:"successful login and jwt token sent"}));
    
    //res.redirect("http://localhost:3000/welcome");
})
module.exports = getToken;