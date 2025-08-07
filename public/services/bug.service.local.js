import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'
import { authService } from './auth.service.local.js'

const STORAGE_KEY = 'bugs'
const PAGE_SIZE = 4

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getEmptyBug,
    getTotalBugs
}

function query(filterBy = {}) {
    const pageIdx = (filterBy.pageIdx !== undefined && filterBy.pageIdx !== null) ? filterBy.pageIdx : 0
    return storageService.query(STORAGE_KEY)
        .then(bugs => {
            
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            }

            if (filterBy.minSeverity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
            }

            if (filterBy.creator) {
                bugs = bugs.filter(bug => bug.creator && bug.creator._id === filterBy.creator)
            }

            if (filterBy.pageIdx !== undefined && filterBy.pageIdx !== null) {
                    const startIdx = pageIdx * PAGE_SIZE // 0, 3, 6
                    bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)

            }

            return bugs
        })
}

function getById(bugId) {
    return storageService.get(STORAGE_KEY, bugId)
}

function remove(bugId) {
    return storageService.remove(STORAGE_KEY, bugId)
}

function save(bug) {
    if (bug._id) {
        return storageService.put(STORAGE_KEY, bug)
    } else {
        bug.creator = authService.getLoggedinUser()
        return storageService.post(STORAGE_KEY, bug)
    }
}

function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (bugs && bugs.length > 0) return

    bugs = [
        {
            title: "Infinite Loop Detected",
            severity: 4,
            _id: "1NF1N1T3",
            labels: ['critical', 'minor']
        },
        {
            title: "Keyboard Not Found",
            severity: 3,
            _id: "K3YB0RD",
            labels: ['dev-branch', 'need-CR']
        },
        {
            title: "404 Coffee Not Found",
            severity: 2,
            _id: "C0FF33",
            labels: ['minor', 'critical']
        },
        {
            title: "Unexpected Response",
            severity: 1,
            _id: "G0053",
            labels: ['need-CR', 'dev-branch']
        }
    ]
    utilService.saveToStorage(STORAGE_KEY, bugs)
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, sortBy: '', sortDir: 1, labels: [], pageIdx: 0 }
}

function getEmptyBug(title = '', description = '', severity = '', labels = []) {
    return { title, description, severity, labels }
}

function getTotalBugs() {
    return query()
        .then(bugs => {
            const totalPages = Math.ceil(bugs.length / 4)
            return Promise.resolve(totalPages)
        })
}