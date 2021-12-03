const mongoose = require('mongoose');

const tableSchema = mongoose.Schema({

    tableNo: {
        type: Number
    },
    isOccupied: {
        type: Boolean
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Table', tableSchema);