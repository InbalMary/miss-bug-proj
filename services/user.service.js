import fs from 'fs'
import { makeId, readJsonFile } from './util.service.js'

const users = readJsonFile('data/user.json')

export const userService = {
	query,
	getById,
	getByUsername,
	remove,
	add,
}

function query() {
	const usersToReturn = users.map(user => ({ _id: user._id, fullname: user.fullname }))
	return Promise.resolve(usersToReturn)
}

function getById(userId) {
	var user = users.find(user => user._id === userId)
	if (!user) return Promise.reject('User not found!')

    user = { ...user }
    delete user.password

	return Promise.resolve(user)
}

function getByUsername(username) {
    // You might want to remove the password validation for dev
	var user = users.find(user => user.username === username)
    return Promise.resolve(user)
}

function remove(userId) {
	const idx = users.findIndex(user => user._id === userId)

	users.splice(idx, 1)
	return _saveUsersToFile()
}

function add(user) {
    
    return getByUsername(user.username) // Check if username exists...
        .then(existingUser => {
            if (existingUser) return Promise.reject('Username taken')

            user._id = makeId()
            // Later, we will call the authService here to encrypt the password
            users.push(user)
        
            return _saveUsersToFile()
                .then(() => {
					user = { ...user }
                    delete user.password
                    return user
                })
        })
}

function _saveUsersToFile() {
	return new Promise((resolve, reject) => {
		const usersStr = JSON.stringify(users, null, 2)
		fs.writeFile('data/user.json', usersStr, err => {
			if (err) {
				return console.log(err)
			}
			resolve()
		})
	})
}