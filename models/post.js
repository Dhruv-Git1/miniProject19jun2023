const mongoose= require('mongoose');


const postSchema =mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    date:{
        type:Date,
        default: Date.now
    },
    content : String,

    likes:[
        {            type: mongoose.Schema.Types.ObjectId, ref: "user"}  //ref is user coz user like karenge so unki id hogi
    ]  //lots of dikkat in where which bracket . here square coz array of ids of people who have liked the post

});

module.exports= mongoose.model('post', postSchema);









