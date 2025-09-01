const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videoUrl:{
        type:String,
    },
    method:{
        type:String,
        required:true
    },
    prompt:{
        type:String,
        required:true
    },
    library:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Library',
        required:true
    }
},{timestamps:true})

module.exports = mongoose.model('Content',ContentSchema)

