const mongoose = require('mongoose');

const dishSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    dishTotal: {
        type: Number
    },
    category: {
        type: String,
    },
    desc: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Dish', dishSchema);