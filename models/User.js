const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pastorders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],
    currentorder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    currentRestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);