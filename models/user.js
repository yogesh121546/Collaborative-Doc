const mongoose= require('mongoose');

const user = new mongoose.Schema({
    socket_id: {
        type: String,
        required: true 
    },
    data: {
        type: String,
        default: null
    }
    //any other fields can be added here
}) 
module.exports = mongoose.model('USER',user); 