import { loggerService } from './logger.service.js'
import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

export const bugService = {
    query,
    getById,
    remove,
    save,
}

const bugs = readJsonFile('./data/bug.json')

function query() {
    return Promise.resolve(bugs)
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