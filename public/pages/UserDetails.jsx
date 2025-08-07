const { useState, useEffect } = React
const { useParams, useNavigate, Link } = ReactRouterDOM

import { userService } from "../services/user.service.js"
import { BugList } from '../cmps/BugList.jsx'
import { bugService } from '../services/bug.service.js'

export function UserDetails() {

    const [user, setUser] = useState(null)
    const [userBugs, setUserBugs] = useState([])
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadUser()
    }, [params.userId])

    useEffect(() => {
        if (user) {
            bugService.query({ creator: user._id })
                .then(bugs => {
                    setUserBugs(bugs)
                })
                .catch(err => {
                    console.error('Err', err)
                })
        }
    }, [user, params.userId])

    function loadUser() {
        userService.getById(params.userId)
            .then(setUser)
            .catch(err => {
                console.log('err:', err)
                navigate('/')
            })
    }

    if (!user) return <div>Loading...</div>

    return <section className="user-details">
        <h1>User: {user.fullname}</h1>
        {/* <pre>
            {JSON.stringify(user, null, 2)}
        </pre> */}
        <h3>About: </h3>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Enim rem accusantium, itaque ut voluptates quo? Vitae animi maiores nisi, assumenda molestias odit provident quaerat accusamus, reprehenderit impedit, possimus est ad?</p>
        <section>
            <h2>Bugs List of {user.fullname} :</h2>
            <BugList bugs={userBugs} />
        </section>
        <Link to="/">Back Home</Link>
    </section>
}