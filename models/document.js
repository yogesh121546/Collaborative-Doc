const mongoose= require('mongoose');
// const user_changes = new mongoose.Schema({
//     email:String,
//     lines_changed:[Number]
// })

const document_schema = new mongoose.Schema({
    title:{
        type: String,
        default: `untitled : ${Date.now().toString()}`
    },
    data: {
        type: String,
        default: null
    },
    shared_users:{
        type:[String],
        default:null
    },
    owner:{
        type:String,
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now
    },
    updated_at:[{
        Date:{
            type:Date,
            default:Date.now
        },
        user: String,
        lines_changed:{
            type:[Number],
            default:[]
        }
    }]
    //any other fields can be added here
}) 
module.exports = mongoose.model('DOCUMENT',document_schema); 