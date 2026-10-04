import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminVerification = () => {
    const [pendingListings, setPendingListings] = useState([]);
    const token = localStorage.getItem('token');

    const fetchPending = async () => {
        try {
            const res = await axios.get(
                'http://localhost:5000/api/admin/pending',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Handle data whether it comes as an array or object
            const data = res.data;

            setPendingListings(
                Array.isArray(data)
                    ? data
                    : (data.internships || [])
            );

        } catch (err) {
            console.error(
                'Error loading pending items',
                err
            );
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    // =====================================================
    // APPROVE
    // =====================================================

    const handleApprove = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/internships/${id}/verify`,
                {
                    status: 'Verified'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert('Listing approved!');
            fetchPending();

        } catch (err) {
            console.error('Approval failed:', err);

            alert(
                err.response?.data?.message ||
                'Approval failed'
            );
        }
    };

    // =====================================================
    // REJECT
    // =====================================================

    const handleReject = async (id) => {

        const confirmReject = window.confirm(
            'Are you sure you want to reject this listing?'
        );

        if (!confirmReject) {
            return;
        }

        try {
            await axios.put(
                `http://localhost:5000/api/admin/internships/${id}/verify`,
                {
                    status: 'Rejected'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert('Listing rejected!');
            fetchPending();

        } catch (err) {
            console.error('Rejection failed:', err);

            alert(
                err.response?.data?.message ||
                'Rejection failed'
            );
        }
    };

    return (
        <div className="container py-4">

            <h2 className="fw-bold mb-4">
                Pending Company & Job Approvals
            </h2>

            {pendingListings.length === 0 ? (

                <p className="text-muted">
                    No pending listings found.
                </p>

            ) : (

                pendingListings.map(item => {

                    const itemId = item._id || item.id;

                    return (
                        <div
                            key={itemId}
                            className="card p-3 mb-3 shadow-sm d-flex flex-row justify-content-between align-items-center"
                        >

                            {/* LISTING INFORMATION */}
                            <div>
                                <h4 className="mb-1">
                                    {item.title} - {item.company}
                                </h4>

                                <p className="text-muted mb-0">
                                    {item.description}
                                </p>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="d-flex gap-2">

                                <button
                                    onClick={() =>
                                        handleApprove(itemId)
                                    }
                                    className="btn btn-success btn-sm"
                                >
                                    Approve Listing
                                </button>

                                <button
                                    onClick={() =>
                                        handleReject(itemId)
                                    }
                                    className="btn btn-danger btn-sm"
                                >
                                    Reject Listing
                                </button>

                            </div>

                        </div>
                    );
                })
            )}

        </div>
    );
};

export default AdminVerification;