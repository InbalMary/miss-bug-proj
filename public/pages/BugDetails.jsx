const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.local.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {

    const [bug, setBug] = useState(null)
    const { bugId } = useParams()

    useEffect(() => {
        bugService.getById(bugId)
            .then(bug => setBug(bug))
            .catch(err => showErrorMsg(`Cannot load bug`, err))
    }, [])

    return <div className="bug-details">
        <h3>Bug Details</h3>
        {!bug && <p className="loading">Loading....</p>}
        {
            bug &&
            <div>
                <h4>{bug.title}</h4>
                <h5>Severity: <span>{bug.severity}</span></h5>
                <p>{bug.description ? bug.description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam esse facilis vitae numquam architecto mollitia fugiat culpa minima aperiam amet sapiente, voluptate sit, in nemo ea. Expedita iure tempore explicabo?'}</p>
                {bug.labels && bug.labels.length > 0 &&
                    <div className="bug-labels">
                        <h5>Labels:</h5>
                        <ul>
                            {bug.labels.map(label => (
                                <li key={label}>{label}</li>
                            ))}
                        </ul>
                    </div>
                }
            </div>
        }
        <hr />
        <Link to="/bug">Back to List</Link>
    </div>

}