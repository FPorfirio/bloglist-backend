const mongoose = require('mongoose')
const { nanoid } = require('nanoid')
const jwt = require('jsonwebtoken')
const authRouter = require('express').Router()
const Session = require('../models/session')
const publicKeys = require('../models/Keys')
const generateJWK = require('../utils/generateJWK')
const generateRsa = require('../utils/generateRsa')


authRouter.get('/', async (req, response, next) => {
    const refreshToken = req.cookies.refreshToken
    const decodedToken = jwt.verify(
        refreshToken,
        process.env.SECRET,
        {   
            algorithm: ['HS256'],
            issuer: ['http://localhost:3001/authorization', 'http://localhost:3001/login'],
            audience: 'http://localhost:3001/authorization'
        }
    ) 
    //can chanche validate to oldSession
    console.log(decodedToken)
    const user = await Session.findById(decodedToken.jti)
    console.log(user)

    if(user){
        const oldSession = await Session.findByIdAndDelete(decodedToken.jti)
        console.log(oldSession)
        const newSession = new Session({
            UUID: oldSession.UUID
        })

        const savedSession = await newSession.save()

        const refreshTokenOpts = {
            issuer: 'http://localhost:3001/authorization',
            audience: 'http://localhost:3001/authorization',
            jwtid: savedSession._id.toString(),
            expiresIn: "7d"
        }
        const refreshToken = jwt.sign({}, process.env.secret, refreshTokenOpts)
    
        const {
            publicKey,
            privateKey,
            publicKeyComponents: {n: modulus, e: exponent}
        } = generateRsa()
        const keyId = nanoid()
        await Promise.all([publicKey, privateKey, keyId])

        const key = generateJWK(keyId, publicKey, modulus, exponent)
        const JWK = new publicKeys(key)
        await JWK.save()
        console.log(newSession)
        const accessTokenBody = {
            scope: newSession.scopes
        }
        const accessTokenOptions = {
            algorithm: 'RS256',
            issuer: 'http://localhost:3001/authorization',
            audience: 'http://localhost:3001/',
            subject: newSession.UUID.toString(),
            keyid: keyId,
            expiresIn: "5m"
        }
        const accessToken = jwt.sign(accessTokenBody, privateKey, accessTokenOptions)
        
        response
		.cookie("refreshToken", refreshToken, {httpOnly: true})
		.status(200)
		.send({accessToken})
    } 
    else {
        response
        .status(401)
        .json({error: 'Unauthorized'})
    }
})

module.exports = authRouter