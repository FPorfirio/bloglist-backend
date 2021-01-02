const dummy = (blogs) => {
	return 1
}
  
const totalLikes = (posts) => {
	return posts.reduce((acc, currentValue) => {
		return acc + currentValue.likes
	}, 0)
}

const mostBlogs = (posts) => {
	const max =  Math.max(...posts.map(post => post.likes))
	const post = posts.filter(post => post.likes == max)[0]
	return {author: post.author, likes: post.likes}
}

module.exports = {
	dummy,
	totalLikes,
	mostBlogs
}