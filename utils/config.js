require('dotenv').config()

// Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vbnRlIiwiaWQiOiI2MDkzYTU2MDczZWU4NzE1MzRjODBkNDgiLCJpYXQiOjE2MjAyODkyNjN9.1QHRMFOvPF88vzmRUP5By4iioirdzf0YT92kOcC8hoc

const PORT = process.env.PORT
let MONGODB_URI = process.env.TEST_MONGODB_URI

if (process.env.NODE_ENV === 'test') {
	MONGODB_URI = process.env.TEST_MONGODB_URI
}

module.exports = {
	MONGODB_URI,
	PORT
}