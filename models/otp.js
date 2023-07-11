const mongoose= require('mongoose');

const OTP = new mongoose.Schema({
    email: {
        type: String, 
        required: true
    },
    otp_hash: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        default:Date.now
    },
    createdAt: { 
        type: Date, 
        expires: '1m', 
        default: Date.now 
    }
});

module.exports= mongoose.model('OTP',OTP);