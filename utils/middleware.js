const logger = require('./logger')
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa');


  
const getKey = async (header, callback) => {
	const client = jwksClient({
		jwksUri: 'http://localhost:3001/api/.well-known/jwks.json'
	})
	const key = await client.getSigningKey(header.kid)
	callback(null, key.getPublicKey())
}

const authenticator = async (request, response, next) => {
	const authorization = request.get('authorization')
	if(authorization && authorization.toLowerCase().startsWith('bearer ')) {
		const token = authorization.substring(7)
		await jwt.verify(
			token, 
			getKey, 
			{ 
				algorithms: ['RS256'],
    			issuer: ['http://localhost:3001/authorization', 'http://localhost:3001/login'],
            	audience: 'http://localhost:3001/'
        	},
			(err, decodedToken) => {
				if(err){
					next(err)
				} else {
					request.token = decodedToken
					next()
				}
			}
		)
	} else {
		response.status(401).end()
	}
}

const authorization = (...permittedRoles) => {
	return (request, response, next) => {
		const { user } = request
	
		if (user && permittedRoles.includes(user.role)) {
		  next(); // role is allowed, so continue on the next middleware
		} else {
		  response.status(403).json({message: "Forbidden"}); // user is forbidden
		}
	}
}

const requestLogger = (request, response, next) => {
	logger.info('Method:', request.method)
	logger.info('Path:  ', request.path)
	logger.info('Body:  ', request.body)
	logger.info('---')
	next()
}

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
	logger.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	} else if (error.name === 'JsonWebTokenError') {
		console.log('porquenollegaaca?s')
		return response.status(401).json({ error: error.message })
	}

	next(error)
}

module.exports = {
	authenticator,
	authorization,
	requestLogger,
	unknownEndpoint,
	errorHandler
}