import { loggerService } from './logger.service.js'
import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

export const bugService = {
    query,
    getById,
    remove,
    save,
}

const bugs = readJsonFile('./data/bug.json')
const PAGE_SIZE = 3

function query(filterBy = {}) {

    let bugsToDisplay = bugs

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title) || regExp.test(bug.description));
    }

    if (filterBy.minSeverity) {
        bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.labels.length > 0) {
        bugsToDisplay = bugsToDisplay.filter(bug => {
            return filterBy.labels.every(filterLabel => bug.labels.includes(filterLabel))
        })
    }

    if (filterBy.sortBy) {
        const sortDir = +filterBy.sortDir || 1
        const field = filterBy.sortBy

        bugsToDisplay.sort((a, b) => {
            if (field === 'title') return a.title.localeCompare(b.title) * sortDir
            if (field === 'severity') return (a.severity - b.severity) * sortDir
            if (field === 'createdAt') return (a.createdAt - b.createdAt) * sortDir
            return 0
        })
    }

    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE // 0, 3, 6
        bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return Promise.resolve(bugsToDisplay)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)

    if (!bug) {
        loggerService.error(`Couldnt find bug ${bugId} in bugService`)
        return Promise.reject(`Couldnt get bug`)
    }
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)

    if (idx === -1) {
        loggerService.error(`Couldnt find bug ${bugId} in bugService`)
        return Promise.reject(`Couldnt remove bug`)
    }

    bugs.splice(idx, 1)
    return _saveBugs()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[idx] = { ...bugs[idx], ...bugToSave }
    } else {
        bugToSave._id = makeId()
        bugToSave.createdAt = Date.now()
        bugs.unshift(bugToSave)
    }
    return _saveBugs()
        .then(() => bugToSave)
}

function _saveBugs() {
    return writeJsonFile('./data/bug.json', bugs)
}