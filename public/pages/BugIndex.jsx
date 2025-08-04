const { useState, useEffect } = React
const { Link } = ReactRouterDOM

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [totalCount, setTotalCount] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

    useEffect(() => {
        loadBugs()
        getTotalCount()
    }, [filterBy])

    function loadBugs() {
        bugService.query(filterBy)
            .then(setBugs)
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function getTotalCount() {
        bugService.getTotalBugs().then((count) => {
            const buttons = []
            buttons.length = count
            buttons.fill({ disabled: false }, 0, count)
            console.log('Total count:', buttons);

            setTotalCount(buttons)
        }).catch(err => showErrorMsg(`Couldn't get total count - ${err}`))

    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            severity: +prompt('Bug severity?', 3),
            description: prompt('Bug description?', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do')
        }

        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    // function onSetFilterBy(fieldsToUpdate) {
    //     setFilterBy(prevFilter => {
    //         if (prevFilter.pageIdx !== undefined) prevFilter.pageIdx = 0
    //         return { ...prevFilter, ...fieldsToUpdate }
    //     })
    // }

    // function onTogglePagination() {
    //     setFilterBy(prevFilter => {
    //         return {
    //             ...prevFilter,
    //             pageIdx: (prevFilter.pageIdx === undefined) ? 0 : undefined
    //         }
    //     })
    // }

    // function onChangePage(diff) {
    //     if (filterBy.pageIdx === undefined) return
    //     setFilterBy(prevFilter => {
    //         let nextPageIdx = prevFilter.pageIdx + diff
    //         if (nextPageIdx < 0) nextPageIdx = 0
    //         // if (nextPageIdx > MAX_PAGE) nextPageIdx = MAX_PAGE
    //         return { ...prevFilter, pageIdx: nextPageIdx }
    //     })
    // }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    function onChangePage(idx) {
        setFilterBy(prevFilter => {
            return { ...prevFilter, pageIdx: idx }
        })
    }

    function onDownloadBugs(ev) {
        ev.stopPropagation()
        window.location.href = '/api/bug/download-pdf'
    }

    return <section className="bug-index main-content">

        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        <header>
            <h3>Bug List</h3>
            <button><Link to="/bug/edit">Add Bug</Link></button>
            {/* <button onClick={onAddBug}>Add Bug</button> */}
            <button onClick={onDownloadBugs}>Download bugs PDF</button>
            {/* <section>
                <button onClick={onTogglePagination}>
                    Toggle Pagination
                </button>
                <button onClick={() => onChangePage(-1)}>-</button>
                <span>{filterBy.pageIdx + 1 || 'No Pagination'}</span>
                <button onClick={() => onChangePage(1)}>+</button>
            </section> */}
        </header>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
        // onEditBug={onEditBug} 
        />
        {totalCount && <footer>
            <div>
                {totalCount.map((btn, idx) => (
                    <button onClick={() => onChangePage(idx)}
                        key={idx} className={`page-btn ${btn.disabled ? 'disabled' : ''}`}>
                        {idx + 1}
                    </button>
                ))}
            </div>
        </footer>}
    </section>
}
