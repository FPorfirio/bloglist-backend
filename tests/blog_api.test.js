const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app') 
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')


const api = supertest(app)


describe('when there is initially some posts saved and a user in db', () => {
	beforeEach(async () => {
		await Blog.deleteMany({})
		const postObjects = helper.initialPosts.map(post => new Blog(post))
		const postPromises = postObjects.map(post => post.save())
		await Promise.all(postPromises)
	})

	test('posts are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})
	
	test('correct amount of posts are returned', async () => {
		const response = await api.get('/api/blogs')
		expect(response.body).toHaveLength(helper.initialPosts.length)
	})
	
	test('post unique identifier is called id', async() => {
		const response = await api.get('/api/blogs/')
		const id = response.body.map(r => r.id)[0]
	
		expect(id).toBeDefined()
	})
})

describe('morcilla', () => {
	beforeEach(async () => {
		await User.deleteMany({})
		await Blog.deleteMany({})
		const passwordHash = await bcrypt.hash('sekret', 10)
		const user = new User({ username: 'root', name: 'rock', passwordHash})
		await user.save()
	})

	test('number of likes default to 0', async () => {
		const newPost = {
			title: 'sure',
			author: 'pedro',
			url: 'ADDDAS'
		}

		const logedUser = await User.findOne({username: 'root'})
		const token = jwt.sign({username: logedUser.username, id: logedUser._id}, process.env.SECRET)

		const newPostPost = await api
			.post('/api/blogs/')
			.send(newPost)
			.set('authorization', `bearer ${token}`)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		
		const newPostGet = await api
			.get(`/api/blogs/${newPostPost.body.id}`)
		
		const likes = newPostGet.body.likes
	
		expect(likes).toBe(0)
	})
	
	test('new post can be added', async () => {
		const newPost = {
			title: 'sure',
			author: 'pedro',
			url: 'ADDDAS',
			likes: 5
		}

		const logedUser = await User.findOne({username: 'root'})
		const token = jwt.sign({username: logedUser.username, id: logedUser._id}, process.env.SECRET)
		console.log(logedUser, token)
		await api
			.post('/api/blogs/')
			.send(newPost)
			.set('authorization', `bearer ${token}`)
			.expect(201)
			.expect('Content-Type', /application\/json/)
	
		const totalPosts = await helper.postsInDb()
		expect(totalPosts).toHaveLength(1)
	
		const contents = totalPosts.map(ele => ele.title)
		expect(contents).toContain('sure')
	})
	
	test('if title and url properties missing response status is 400', async () => {
		const newPost = {
			author: 'pedro',
			likes: 5
		}

		const logedUser = await User.findOne({username: 'root'})
		const token = jwt.sign({username: logedUser.username, id: logedUser._id}, process.env.SECRET)
	
		await api
			.post('/api/blogs/')
			.send(newPost)
			.set('authorization', `bearer ${token}`)
			.expect(400)

		const totalPosts = await helper.postsInDb()
		expect(totalPosts).toHaveLength(0)
	})

	test('Delete operation throw status code 401 without valid token', async () => {
		
		const user = await User.findOne({username: 'root'})
		const invalidToken = jwt.sign({username: 'martin', id: new mongoose.Types.ObjectId()}, process.env.SECRET)

		const newPost = new Blog({
			title: 'man',
			author: 'tired',
			url: 'panchoo',
			likes: 30,
			user: user._id
		})

		console.log(newPost)

		await newPost.save()	

		await api
			.delete(`/api/blogs/${newPost._id}`)
			.set('authorization', `bearer ${invalidToken}`)
			.expect(401)
	})
})

describe('At least 1 user is in DB', () => {
	beforeEach(async () => {
		await User.deleteMany({})
		const passwordHash = await bcrypt.hash('sekret', 10)
		const user = new User({ username: 'root', name: 'rock', passwordHash})
		await user.save()
	})

	test('creation succeeds with fresh userName', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'sprint',
			name: 'willy',
			password: 'asdasdasd'
		}
		await api.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		console.log(usersAtEnd)
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const content = usersAtEnd.map(user => user.username)
		expect(content).toContain('sprint')
	})

	test('login works with valid username and password', async () =>{
		const user = {
			username: 'root', 
			password: 'sekret'
		}

		const response = await api.post('/api/login')
			.send(user)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		console.log(response)
	})

	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtTheStart = await helper.usersInDb()

		const newUser = {
			username: 'root',
			name: 'willy',
			password: 'sekret'
		}

		const result = await api.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('username must be unique')

		const usersAtTheEnd = await helper.usersInDb()
		expect(usersAtTheEnd).toHaveLength(usersAtTheStart.length)
	})
})

afterAll(() => {
	mongoose.connection.close()
})