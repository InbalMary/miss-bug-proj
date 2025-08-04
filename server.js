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
app.set('query parser', 'extended')

app.get('/', (req, res) => res.send('Hello there'))

//* Read 
app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        labels: req.query.labels || [],
        pageIdx: parseInt(req.query.pageIdx) || 0,
        sortBy: req.query.sortBy || '',
        sortDir: +req.query.sortDir || 1,
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch((err) => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.get('/api/bug/totalBugs', (req, res) => {

    bugService.getTotalCount().then((count) => {
        res.status(200).json(count);
    })

        .catch((err) => {
            loggerService.error('Cannot get total bugs', err)
            res.status(503).send('Cannot get total bugs')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    console.log('req.body', req.body)
    const { title, description, severity, labels } = req.body

    const bugToSave = {
        title,
        description,
        severity: +severity,
        labels,
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

    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
        labels,
    }

    bugService.save(bugToSave)
        .then(updatedBug => res.send(updatedBug))
        .catch(err => {
            loggerService.error('Cannot update bug', err)
            res.status(400).send('Cannot update bug')
        })
})


app.get('/api/bug/download-pdf', (req, res) => {
    bugService.query()
        .then(bugs => {
            res.setHeader('Content-Disposition', 'attachment; filename=bugs.pdf')
            res.setHeader('Content-Type', 'application/pdf')

            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' })
            doc.pipe(res)

            return createPdf(doc, bugs).then(() => doc.end())
        })
        .catch(err => {
            loggerService.error('PDF creation failed', err)
            res.status(500).send('Failed to generate PDF')
        })
})

//* Get/Read by id
app.get('/api/bug/:id', (req, res) => {
    const bugId = req.params.id
    //here add the cookie check
    let visitedBugs = JSON.parse(req.cookies.visitedBugs || '[]')
    console.log('visitedBugs:', visitedBugs)

    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) {
            return res.status(401).send('Wait for a bit')
        }
        visitedBugs.push(bugId)
    }
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 7 * 60 })

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
        headers: ['Title', 'Severity', 'Description', 'Created At', 'Labels'],
        rows: bugs.map(bug => [
            bug.title,
            +bug.severity,
            bug.description,
            formatDate(bug.createdAt),
            (bug.labels || []).join(', ')
        ])
    }

    return doc.table(table, { columnsSize: [100, 70, 150, 90, 100] })
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
