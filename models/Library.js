const mongoose = require('mongoose');

const LibrarySchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    level:{
        type:String,
        required:true
    },
    content:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Content"
    },
    icon:{
        type:String,
        required:true
    }
    },{timestamps:true})


module.exports = mongoose.model('Library',LibrarySchema)