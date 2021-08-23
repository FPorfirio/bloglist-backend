const express = require('express')
const mongoose = require('mongoose')
require('express-async-errors')
const logger = require('./utils/logger')
var cookieParser = require('cookie-parser')
const app = express()

const cors = require('cors')
const config = require('./utils/config')
const blogRouter = require('./controllers/posts')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const commentRouter = require('./controllers/comments')
const keysRouter = require('./controllers/publicKeys')
const middleware = require('./utils/middleware')
const authRouter = require('./controllers/authorization')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
.then(() => {
	logger.info('connected to MongoDB')
})
.catch((error) => {
	logger.error('error connecting to MongoDB:', error.message)
})

app.use(cookieParser())
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogRouter)
app.use('/api/users', usersRouter)
app.use('/api/comments', commentRouter )
app.use('/api/.well-known/jwks.json', keysRouter)
app.use('/login', loginRouter)
app.use('/authorization/', authRouter)

if(process.env.NODE_ENV === 'test'){
	console.log('fuuuuck')
	const testingRouter = require('./controllers/testing')
	app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports =  app