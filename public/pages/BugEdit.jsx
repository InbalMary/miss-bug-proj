import { bugService } from "../services/bug.service.js"
import { showErrorMsg } from "../services/event-bus.service.js"

const { useState, useEffect } = React
const { useNavigate, useParams, Link } = ReactRouterDOM


export function BugEdit() {

    const [bugToEdit, setBugToEdit] = useState(bugService.getEmptyBug())
    const navigate = useNavigate()
    const { bugId } = useParams()

    useEffect(() => {
        if (bugId) loadBug()
    }, [])


    function loadBug() {
        bugService.getById(bugId)
            .then(bug => setBugToEdit(bug))
            .catch(err => console.log('Cannot get bug:', err))
    }


    function onSaveBug(ev) {
        ev.preventDefault()
        bugService.save(bugToEdit)
            .then(() => navigate('/bug'))
            .catch(err => {
                console.log('Cannot save bug:', err)
                showErrorMsg('Cannot save bug')
            })
    }

    function handleChange({ target }) {
        const field = target.name
        let value = target.value
        switch (target.type) {
            case 'number':
            case 'range':
                value = +value
                break;

            case 'checkbox':
                value = target.checked
                break
        }
        setBugToEdit(prevBug => ({ ...prevBug, [field]: value }))
    }

    const { title, description, severity } = bugToEdit
    return (
        <section className="bug-edit">
            <h1>{bugId ? 'Edit' : 'Add'} Bug</h1>
            <form onSubmit={onSaveBug}>
                <label htmlFor="title">Title</label>
                <input onChange={handleChange} value={title} type="text" name="title" id="title" placeholder={`Bug ${Date.now()}`}/>

                <label htmlFor="description">Description</label>
                <input onChange={handleChange} value={description} type="text" name="description" id="description" placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do" />

                <label htmlFor="severity">Severity</label>
                <input onChange={handleChange} value={severity || ''} type="number" name="severity" id="severity" placeholder="3"/>

                <button>Save</button>
                <button><Link to="/bug">Cancel</Link></button>
                
            </form>

        </section>
    )

}