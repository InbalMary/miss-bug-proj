import express from 'express'
import PDFDocument from 'pdfkit-table'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))

app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
})

app.get('/api/bug/save', (req, res) => {
    const { title, description, severity, createdAt, _id } = req.query
    console.log('req.query', req.query)
    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
        createdAt,
    }

    console.log('bugToSave', bugToSave)
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
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

app.get('/api/bug/:id', (req, res) => {
    const bugId = req.params.id

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.get('/api/bug/:id/remove', (req, res) => {
    const bugId = req.params.id

    bugService.remove(bugId)
        .then(() => res.send(`bug ${bugId} deleted`))
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

app.get('/', (req, res) => res.send('Hello there'))

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
