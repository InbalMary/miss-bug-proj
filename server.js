import path from 'path'

import express from 'express'
import PDFDocument from 'pdfkit-table'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => res.send('Hello there'))

//* Read 
app.get('/api/bug', (req, res) => {

    const filterBy = {
        txt: req.query.txt,
        minSeverity: +req.query.minSpeed,
        labels: req.query.labels,
        pageIdx: req.query.pageIdx
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch((err) => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    const { title, description, severity, labels } = req.body

    let labelsArray = []
    if (typeof labels === 'string') labelsArray = labels.split(',')
    else if (Array.isArray(labels)) labelsArray = labels

    const bugToSave = {
        title,
        description,
        severity: +severity,
        labels: labelsArray,
    }

    console.log('bugToSave', bugToSave)
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

//* Update
app.put('/api/bug/:bugId', (req, res) => {
    const { title, description, severity, labels, _id } = req.body

    let labelsArray = []
    if (typeof labels === 'string') labelsArray = labels.split(',')
    else if (Array.isArray(labels)) labelsArray = labels

    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
        labels: labelsArray,
    }

    bugService.save(bugToSave)
        .then(updatedBug => res.send(updatedBug))
        .catch(err => {
            loggerService.error('Cannot update bug', err)
            res.status(400).send('Cannot update bug')
        })
})


app.get('/api/bug/download-pdf', (req, res) => {
    let doc = new PDFDocument({ margin: '30', size: 'A4', layout: 'landscape' })

    doc.pipe(res)

    bugService.query()
        .then(bugs => {
            console.log('bugs:', bugs)
            return createPdf(doc, bugs)
        })
        .then(() => {
            doc.end()
        })
})

app.get('/api/bug/cookies', (req, res) => {
    const bugId = req.query._id
    console.log('req.cookies:', req.cookies)

    let visitedBugs = JSON.parse(req.cookies.visitedBugs || '[]')
    console.log('visitedBugs:', visitedBugs)

    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) {
            return res.status(401).send('Wait for a bit')
        }
        visitedBugs.push(bugId)
    }
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 7 * 60 })

    // res.send(`visitedBugs arr - ${visitedBugs}`)
    bugService.getById(bugId)
        .then(bug => {
            res.json(bug)
        })
        .catch(err => {
            res.status(400).send(err)
        })
})

//* Get/Read by id
app.get('/api/bug/:id', (req, res) => {
    const bugId = req.params.id

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

//* Remove/Delete
app.delete('/api/bug/:id', (req, res) => {
    const bugId = req.params

    bugService.remove(bugId)
        .then(() => {
            loggerService.info(`Bug ${bugId} removed`)
            res.send(`Removed!`)
        })
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

function createPdf(doc, bugs) {
    const table = {
        title: 'Bugs',
        subtitle: 'List of all bugs:',
        headers: ['title', 'severity', 'description', 'createdAt'],
        rows: bugs.map(bug => [
            bug.title,
            +bug.severity,
            bug.description,
            formatDate(bug.createdAt)
        ])
    }
    return doc.table(table, { columnsSize: [100, 100, 100, 100] })
}

function formatDate(timestamp) {
    const date = new Date(timestamp)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)

    return `${day}/${month}/${year}`
}

//* Fallback route (For production or when using browser-router)
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
