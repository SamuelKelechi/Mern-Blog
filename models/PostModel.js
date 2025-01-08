const {Schema, model} = require('mongoose')

const postSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    story: {type: String, required: true},
    avatar: {type: String, required: true},
}, {timestamps: true})


module.exports = model("postModel", postSchema)