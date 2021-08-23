const UserRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

UserRouter.get('/', async (request, response, next) => {
	const users = await User.find({})
		.populate('posts')

	response.json(users)
})

UserRouter.get('/:id', async (request, response, next) => {
	const id = request.params.id
	const user = await User.findById(id)
	response.json(user)
})

UserRouter.post('/', async (request, response, next) => {
	const body = request.body

	const validUsername = body.username.length >= 3 ? body.username : false
	const validPassword = body.password.length >= 3 ? body.password : false

	if(!(validUsername && validPassword)){
		response.status(401).json({error: 'username missing or invalid'})
	}

	const userDuplicate = await User.find({username: body.username})
	if(userDuplicate.length){
		console.log(body)
		return response.status(400).json({error: 'username must be unique'})
	}
	
	const saltRounds = 10
	const passwordHash = await bcrypt.hash(validPassword, saltRounds)

	const user = new User({
		username: validUsername,
		name: body.name,
		passwordHash,
	})
	const savedUser = await user.save()
    
	response.status(201).json(savedUser)
})

module.exports = UserRouter