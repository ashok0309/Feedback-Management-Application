import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


const Card = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [fetchError, setFetchError] = useState(''); // Error state for fetching data
    const [submitError, setSubmitError] = useState(''); // Error state for submitting response

    // State for filtering
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        async function getUser() {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/comments');
                if (!response.ok) {
                    throw new Error('Failed to fetch data'); // Throw an error if response is not ok
                }
                const result = await response.json();
                const enrichedData = result.slice(0, 10).map((item) => ({
                    ...item,
                    created_at: new Date().getTime() - Math.floor(Math.random() * 1000000000),
                    status: 'pending',
                }));
                const sortedData = enrichedData.sort((a, b) => a.created_at - b.created_at);
                setData(sortedData);
                setFilteredData(sortedData);
            } catch (error) {
                setFetchError(error.message); // Set fetch error message
                console.error(error);
            }
        }
        getUser();
    }, []);

    const handleOpenModal = (feedback) => {
        setSelectedFeedback(feedback);
        setResponseText('');
        setErrorMessage('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setResponseText('');
        setSubmitError(''); // Clear submit error when closing modal
    };

    const handleAction = (action) => {
        if (selectedFeedback) {
            if (responseText.trim() === '') {
                setErrorMessage('Response cannot be empty.');
                return;
            }

            try {
                // Simulate response submission (could be a POST request in a real scenario)
                const updatedData = data.map((item) =>
                    item.id === selectedFeedback.id ? { ...item, status: action, response: responseText } : item
                );

                // Simulating a possible error during submission
                if (Math.random() < 0.1) { // 10% chance to simulate a submission error
                    throw new Error('Failed to submit your response. Please try again.');
                }

                setData(updatedData);
                filterData(startDate, endDate, statusFilter);
                handleCloseModal();
            } catch (error) {
                setSubmitError(error.message); // Set submit error message
                console.error(error);
            }
        }
    };

    const filterData = (start, end, status) => {
        let filtered = data;

        if (start && end) {
            const startTime = new Date(start).getTime();
            const endTime = new Date(end).getTime();
            filtered = filtered.filter(item => item.created_at >= startTime && item.created_at <= endTime);
        }

        if (status) {
            filtered = filtered.filter(item => item.status === status);
        }

        setFilteredData(filtered);
    };

    const handleDateChange = () => {
        filterData(startDate, endDate, statusFilter);
    };

    const handleStatusChange = (event) => {
        const selectedStatus = event.target.value;
        setStatusFilter(selectedStatus);
        filterData(startDate, endDate, selectedStatus);
    };

    return (
        <div className="container mt-4">
            {/* Error Message for Fetching Data */}
            {fetchError && <div className="alert alert-danger">{fetchError}</div>}

            {/* Filtering Section */}
            <div className="mb-4 p-3 border rounded bg-light shadow-sm">
                <h4>Filter Feedback</h4>
                <div className="row mb-2">
                    <div className="col-md-6 mb-2">
                        <label htmlFor="startDate">Start Date:</label>
                        <input type="date" className="form-control" id="startDate" value={startDate} onChange={(e) => {
                            setStartDate(e.target.value);
                            handleDateChange();
                        }} />
                    </div>
                    <div className="col-md-6 mb-2">
                        <label htmlFor="endDate">End Date:</label>
                        <input type="date" className="form-control" id="endDate" value={endDate} onChange={(e) => {
                            setEndDate(e.target.value);
                            handleDateChange();
                        }} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Status:</label>
                    <select className="form-control" value={statusFilter} onChange={handleStatusChange}>
                        <option value="">All</option>
                        <option value="Acknowledged">Acknowledged</option>
                        <option value="Addressed">Addressed</option>
                        <option value="Ignored">Ignored</option>
                    </select>
                </div>
            </div>

            {/* Feedback Cards */}
            <div className="row">
                {filteredData.map((val, index) => (
                    <div key={index} className="col-sm-12 col-md-6 col-lg-4 mb-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{val.name}</h5>
                                <p className="card-text">{val.body}</p>
                                <p><strong>Created At:</strong> {new Date(val.created_at).toLocaleString()}</p>
                                <p><strong>Status:</strong> {val.status}</p>
                                <button className="btn btn-primary" onClick={() => handleOpenModal(val)}>
                                    View Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
    <div className="modal-overlay">
        <div className="modal-content">
            <h3 className="modal-title">Feedback Response</h3>
            <h5 className="modal-feedback">Feedback: {selectedFeedback.body}</h5>
            <div className="form-group">
                <label htmlFor="responseText">Your Response</label>
                <textarea
                    className="form-control"
                    id="responseText"
                    rows="3"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response here"
                />
                {errorMessage && <div className="text-danger">{errorMessage}</div>}
                {submitError && <div className="text-danger">{submitError}</div>}
            </div>
            <div className="modal-buttons">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                <button className="btn btn-success" onClick={() => handleAction('Acknowledged')}>Acknowledge</button>
                <button className="btn btn-info" onClick={() => handleAction('Addressed')}>Address</button>
                <button className="btn btn-danger" onClick={() => handleAction('Ignored')}>Ignore</button>
            </div>
        </div>
    </div>
)}

        </div>
    );
};

export default Card;
