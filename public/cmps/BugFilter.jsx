const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    function handleLabelChange({ target }) {
        const labelValue = target.value
        const isChecked = target.checked

        setFilterByToEdit(prevFilter => ({
            ...prevFilter,
            labels: isChecked ? [...prevFilter.labels, labelValue]
                : prevFilter.labels.filter(label => label !== labelValue)
        }))
    }

    const { txt, minSeverity, sortBy, sortDir, labels } = filterByToEdit
    const labelOptions = ['critical', 'need-CR', 'dev-branch', 'minor']
    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

                <label htmlFor="sortBy">Sort By:</label>
                <select name="sortBy" id="sortBy" value={sortBy || ''} onChange={handleChange}>
                    <option value="">-- Choose --</option>
                    <option value="title">Title</option>
                    <option value="severity">Severity</option>
                    <option value="createdAt">Created At</option>
                </select>

                <section>
                    <span>Sort Direction:</span>
                    <label>
                        <input type="radio" name="sortDir" value={1} checked={+sortDir === 1} onChange={handleChange} />
                        Ascending
                    </label>
                    <label>
                        <input type="radio" name="sortDir" value={-1} checked={+sortDir === -1} onChange={handleChange} />
                        Descending
                    </label>
                </section>
                <span>Labels:</span>
                {labelOptions.map(labelOption => (
                    <label key={labelOption}>
                        <input
                            type="checkbox"
                            value={labelOption}
                            checked={labels.includes(labelOption)}
                            onChange={handleLabelChange}
                        />
                        {labelOption}
                    </label>
                ))}
            </form>
        </section>
    )
}