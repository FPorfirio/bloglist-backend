const blogRouter = require('express').Router()
const Blog = require('../models/blog') 
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogRouter.get('/', async (request, response, next) => {
	const posts = await Blog.find({})
		.populate('user')
	response.json(posts)
})

blogRouter.get('/:id', async (request, response, next) => {
	const post = await Blog.findById(request.params.id)
		.populate('user')

	if(post){
		response.json(post)
	}
	else{
		response.status(404).end()
	}
})
  
blogRouter.post('/', async (request, response, next) => {
	const body = request.body

	const token = request.token
	const decodedToken = token && token.id ? jwt.verify(request.token, process.env.SECRET) : false
	
	if(!decodedToken){
		return response.status(401)
			.json({error: 'token missing or invalid'})
	}
	
	const user = await User.findById(decodedToken.id)

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
		user: user._id
	})

	if (blog.title && blog.url) {
		const savedPost = await blog.save()
		user.posts = user.posts.concat(savedPost._id)
		await user.save()
		response.status(201).json(savedPost)
	} else {
		response.status(400).end()
	}
})

blogRouter.put('/:id', async (request, response, next) =>{
	const post = request.body
	
	const newPost = {
		title: post.title,
		author: post.author,
		url: post.url,
		likes: post.likes
	}
	const updatedPost = Blog.findByIdAndUpdate(request.params.id, newPost, { new: true })
	response.json(updatedPost)
})

blogRouter.delete('/:id', async (request, response, next) => {
	const token = request.token
	const decodedToken = token && token.id ? jwt.verify(request.token, process.env.SECRET) : false
	
	if(!decodedToken){
		return response.status(401)
			.json({error: 'token missing or invalid'})
	}

	const post = await Blog.findById(request.params.id).populate('user')

	
	if (post.user.toString() === decodedToken.id.toString()){
		await Blog.findByIdAndDelete(request.params.id)
		response.status(204).end()
	}
})

module.exports = blogRouter