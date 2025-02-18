import mongoose from "mongoose";

const chatSchema=mongoose.Schema({
    Name: String,
    message: String,
    date:{
        type: Date
    },
});

const chatMessage = mongoose.model('chatMessage',chatSchema);

export default chatMessage;