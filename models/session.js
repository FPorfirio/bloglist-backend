const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    UUID: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now, index: { expires: '1m' } }
})

module.exports = mongoose.model('Session', sessionSchema)

//        createdAt: { type: Date, expires: 10000, default: Date.now },
