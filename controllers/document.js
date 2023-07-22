const { StatusCodes } = require("http-status-codes");
const customError = require("../errors/custom-error");
const async_wrapper = require("../middleware/async_wrapper");
const DOCUMENT = require('../models/document');
const USER = require('../models/user');

const createDocument= async_wrapper(async(req,res)=>{
    const {email} = req.user;
    const docCreated = await DOCUMENT.create({owner:email,updated_at:{user:email}});
    //console.log(docCreated);
    const updtateUserDocList = await USER.findOneAndUpdate({email:email},{"$push":{Docs:[docCreated._id]}});
    //console.log(updtateUserDocList);
    const user= await USER.where("email").equals(email).populate("Docs").exec();
    //console.log(user[0].Docs);
    res.json({msg:"doc created successfully",document_id:docCreated._id});
});

const getDocument = async_wrapper(async(req,res)=>{
    const {docId}= req.query;
    const {email}= req.user;
   //let email = "hell";
    console.log(docId,email);
    const Document = await DOCUMENT.find(
        {
            $and:[
                {  _id : docId},
                {   $or:[
                        {shared_users:{$in:[`${email}`]}},
                        {owner:email},
                    ]
                },
            ] 
        });
    if(!Document[0]){
        throw new customError("unauthorised",StatusCodes.UNAUTHORIZED);
    }
    res.render('document.ejs');
})
 
module.exports={createDocument,getDocument};