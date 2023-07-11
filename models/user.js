const mongoose= require('mongoose');
const document_schema = require('./document')
const user_schema = new mongoose.Schema({
    email: {
        type: String,
        required: true 
    },
    Docs:{
        type: [mongoose.SchemaTypes.ObjectId],
        ref:'DOCUMENT',
        default:[]
    },
      username:{
        type: String,
        required: true
    },
    pass_hash:{
        type: String,
        default:null
    }
    //any other fields can be added here
}) 
module.exports = mongoose.model('USER',user_schema); 