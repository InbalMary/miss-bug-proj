
const BASE_URL = '/api/bug'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getEmptyBug,
}

function query(filterBy = {}) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
        // .then(bugs => {

        //     if (filterBy.txt) {
        //         const regExp = new RegExp(filterBy.txt, 'i')
        //         bugs = bugs.filter(bug => regExp.test(bug.title))
        //     }

        //     if (filterBy.minSeverity) {
        //         bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
        //     }

        //     return bugs
        // })
}

function getById(bugId) {
    return axios.get(`${BASE_URL}/${bugId}`)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(`${BASE_URL}/${bugId}`)
    .then(res => res.data)
}

// function save(bug) {
//     console.log('bug', bug)
//     var queryStr = `/save/?title=${bug.title}&description=${bug.description}&severity=${bug.severity}`

//     if (bug._id) queryStr += `&_id=${bug._id}`

//     if (bug.labels && bug.labels.length > 0) {
//         const labelsStr = bug.labels.join(',')
//         queryStr += `&labels=${labelsStr}`
//     }
//     console.log('queryStr', queryStr)
//     return axios.get(BASE_URL + queryStr)
//         .then(res => res.data)
// }

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL + '/' + bug._id, bug).then(res => res.data)
    } else {
        console.log('bug', bug)
        return axios.post(BASE_URL, bug).then(res => res.data)
    }
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, sortBy: '', sortDir: 1, labels : [] }
}

function getEmptyBug(title = '', description = '', severity = '', labels = []) {
    return { title, description, severity, labels }
}