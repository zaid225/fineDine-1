const mongoose = require('mongoose');

const dishSchema = mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    price: {
        type: Number,
    },
    category: {
        type: String,
    },
    desc: {
        type: String,
    },
    quantity: {
        type: Number,
    }
})



module.exports = mongoose.model('Dishes', dishSchema);