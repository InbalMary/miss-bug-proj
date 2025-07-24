import express from 'express' 

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
	const bugToSave = {
        _id,
		title,
        description,
		severity: +severity,
        createdAt,
	}

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
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

app.get('/', (req, res) => res.send('Hello there')) 

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
