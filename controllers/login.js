const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const Session = require('../models/session')
const Key = require('../models/Keys')
const mongoose = require('mongoose')
const { nanoid } = require('nanoid')
const generateJWK = require('../utils/generateJWK')
const generateRsa = require('../utils/generateRsa')

loginRouter.post('/', async (request, response, next) => {
	const body = request.body
    
	const user = await User.findOne({username: body.username})

	const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash) 

	if(!(user && passwordCorrect)){
		return response.status(401).json({
			error: 'invalid username or password'
		})
	}

	const userInfo = {name: user.username}
	
	const session = new Session({
		UUID: user._id
	})
	const savedSession =  await session.save()

	const refreshTokenOpts = {
		issuer: "http://localhost:3001/login",
		audience: "http://localhost:3001/authorization",
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
	const JWK = new Key(key)
	await JWK.save()
	console.log(privateKey)
	const accessTokenBody = {
		scope: user.scopes
	}
	const accessTokenOptions = {
		algorithm: 'RS256',
		issuer: 'http://localhost:3001/login',
		audience: 'http://localhost:3001/',
		subject: user._id.toString(),
		keyid: keyId,
		//expiresIn: "5m"
	}
	const accessToken = jwt.sign(accessTokenBody, privateKey, accessTokenOptions)

	response
		.cookie("refreshToken", refreshToken, {httpOnly: true})
		.status(200)
		.send({accessToken, userInfo})
})

module.exports = loginRouter
