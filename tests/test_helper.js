const Blog = require('../models/blog')
const User = require('../models/user')

const initialPosts = [
	{
		title: 'the person',
		author: 'peter jackson',
		url: 'panchoo',
		likes: 30
	},
	{
		title: 'the lacker',
		author: 'john ands',
		url: 'perroo',
		likes: 5
	}
]

const InitialUsers = [
	{
		username: 'rob',
		name: 'robert',
		passwordHash: '123213213',
	},
	{
		username: 'dog123',
		name: 'peter',
		passwordHash: 'eas34234',
	}
]

const nonExistingId = async () => {
	const post = new Blog({ content: 'willremovethissoon', date: new Date() })
	await post.save()
	await post.remove()
	return post._id.toString()
}

const postsInDb = async () => {
	const posts = await Blog.find({})
	return posts.map(post => post.toJSON())
}

const usersInDb = async () => {
	const users = await User.find({})
	return users.map(user => user.toJSON())
}

module.exports = {initialPosts, nonExistingId, postsInDb, usersInDb, InitialUsers}