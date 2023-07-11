const express = require('express');
const {signup,verify_otp} = require('../controllers/signup');
const login = require('../controllers/login');
const authenticateToken = require('../middleware/jwtAuth');
const logout = require('../controllers/logout');
const {createDocument, getDocument} = require('../controllers/document');
const router= express.Router();


//routes
router.route('/signup').post(signup);
router.route('/signup/verify').post(verify_otp);
router.route('/login').post(login);
router.route('/createDocument').get(authenticateToken,createDocument);
router.route('/document').get(authenticateToken,getDocument);
router.route('/').get(authenticateToken,(req,res)=>{
    res.status(200).json({msg:"jwt works",info: req.user})
});
router.route('/logout').get(authenticateToken,logout);


module.exports= router;