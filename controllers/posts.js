const blogRouter = require('express').Router()
const Blog = require('../models/blog') 
const User = require('../models/user')
const middleware = require('../utils/middleware')


blogRouter.get('/', async (request, response, next) => {
	const userId = request.query.userId
	if(userId) {
		const userPosts = await Blog.find({'user': userId}) 
		if(userPosts.length) {
			return response.status(200).json(userPosts)
		} else {
			response.status(404).end()
		}
	} 
	const posts = await Blog.find({})
		.populate('user', {username: 1, name: 1})
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
  
blogRouter.post('/', middleware.authenticator,  async (request, response, next) => {
	const body = request.body
	const token = request.token
	
	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
		user: token.sub
	})

	if (blog.title && blog.url) {
		const saveBlogQuery = blog.save()
		const userQuery = User.findById(token.sub)
		const [user, savedPost] = await Promise.all([userQuery, saveBlogQuery])
		
		user.posts = user.posts.concat(savedPost._id)
		await user.save()
		
		Blog.populate(savedPost, {path: 'user', select: {username: 1, name: 1}})
		return response.status(201).json(savedPost)
	} else {
		response.status(400).end()
	}
})

blogRouter.put('/:id', middleware.authenticator, async (request, response, next) =>{
	const body = request.body
	const token = request.token
	const id = request.params.id

	const blog = await Blog.findById(id)
	if(body.hasOwnProperty('likes')) {
		blog.likes = blog.likes + 1
		const savedBlog = await blog.save()
		await Blog.populate(savedBlog, {path: 'user', select: {username: 1, name: 1}})
		await Blog.populate(savedBlog, {path: 'comments'})
		response.status(200).json(savedBlog)

	} else if(blog.user.toString() == token.sub.toString()) {
		const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true })
																.populate('user', {username: 1, name: 1})
																.populate('comments')
		console.log('lareconchadetumadree')
		response.status(200).json(updatedBlog)
	} else {
		response.status(403).end()
	}
})

blogRouter.delete('/:id', middleware.authenticator, async (request, response, next) => { 	
	const token = request.token

	const post = await Blog.findById(request.params.id).populate('user')

	if (post?.user.id.toString() === token.sub.toString()){
		await Blog.findByIdAndDelete(request.params.id)
		response.status(204).end()
	}else {
		response.status(404).end()
	}
})

module.exports = blogRouter