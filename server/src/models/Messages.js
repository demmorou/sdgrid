const {model,  Schema} = require('mongoose');

const MessageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

module.exports = model('Messages', MessageSchema);