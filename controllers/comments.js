const commentRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const middleware = require('../utils/middleware')
const ObjectId = require('mongoose').Types.ObjectId


commentRouter.get('/:id', async (request, response) => {
    const commentId = request.params.id
    const comment = await Comment.findById(commentId)
    console.log(comment)
    if(comment) {
        response.status(200).json(comment)
    } else {
        response.status(404).end()
    }
})

commentRouter.get('/', async (request, response) => {
    const blogId = request.query.blogId
    const comments = await Comment.find({ 'blog': blogId })
    console.log(comments == true)
    if(comments.length){
        console.log('quemierdapasaa')
        response.status(200).json(comments)
    } else {
        console.log('lareputamadreee')
        response.status(404).end()
    }    
})



commentRouter.post('/', middleware.authenticator, async (request, response) => {  
    const body = request.body
    const token = request.token
    console.log(body)
    if(!body.content || !body.blogId) {
        return response.status(400).end()
    }
    console.log('safooo')
    const userQuery = User.findById(token.sub).exec()
    const blogQuery = Blog.findById(body.blogId).exec()
    const [user, blog] = await Promise.all([userQuery, blogQuery])
    
    const comment = new Comment({
        content: body.content,
        blog: body.blogId,
        user: token.sub
    })
    const savedComment = await comment.save()
    
    user.comments = user.comments.concat(savedComment._id)
    blog.comments = blog.comments.concat(savedComment._id)
    await Promise.all([blog.save(), user.save()])
    response.status(201).json(savedComment)
})

module.exports = commentRouter