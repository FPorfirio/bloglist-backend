const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    alg: String,
    kty: String,
    use: String,
    //x5c: [String],
    kid: String,
    n: String,
    e: String
})

module.exports = mongoose.model('Jwk', schema)