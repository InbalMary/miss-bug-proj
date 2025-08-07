const { useState, useEffect } = React
const { Link } = ReactRouterDOM

import { userService } from "../services/user.service.local.js"

export function UserIndex() {
    const [users, setUsers] = useState([])

    useEffect(() => {
        userService.query()
            .then(setUsers)
            .catch(err => console.log('err', err))
    }, [])

    function handleRemoveUser(userId) {
        userService.remove(userId)
            .then(() => {
                setUsers(users.filter(user => user._id !== userId))
            })
            .catch(err => console.log('err', err))
    }

    return (
        <section className="user-index">
            <h2>User List</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id}>
                        <Link to={`/user/${user._id}`}>{user.fullname}</Link>
                        <button onClick={() => handleRemoveUser(user._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </section>
    )
}