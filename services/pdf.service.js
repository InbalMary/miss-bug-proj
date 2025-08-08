import { formatDate } from './util.service.js'


export const pdfService = {
    createPdf,
}

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