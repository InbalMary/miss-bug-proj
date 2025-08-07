import { bugService } from './bug.service.js'

const BASE_URL = '/api/user/'

export const userService = {
    query,
    getById,
    getEmptyCredentials,
    remove
}

function query() {
    return axios.get(BASE_URL)
        .then(res => res.data)
}

function getById(userId) {
    return axios.get(BASE_URL + userId)
        .then(res => res.data)
}

function getEmptyCredentials() {
    return {
        username: '',
        password: '',
        fullname: ''
    }
}

function remove(userId) {
    return axios.delete(BASE_URL + userId)
        .then(res => res.data)
}