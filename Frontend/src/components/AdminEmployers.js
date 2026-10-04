import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminEmployers = () => {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchEmployers();
    }, []);

    // =====================================================
    // FETCH EMPLOYERS
    // =====================================================

    const fetchEmployers = async () => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.get(
                'http://localhost:5000/api/admin/employers',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Employers API response:', res.data);

            const data = Array.isArray(res.data)
                ? res.data
                : res.data.employers || [];

            setEmployers(data);

        } catch (err) {
            console.error(
                'Failed to fetch employers:',
                err.response?.data || err.message
            );

            setEmployers([]);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // VERIFY / REJECT EMPLOYER
    // =====================================================

    const updateEmployerStatus = async (employerId, status) => {
        const actionText =
            status === 'Verified'
                ? 'verify'
                : 'reject';

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this employer?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            setActionLoading(employerId);

            const res = await axios.put(
                `http://localhost:5000/api/admin/employers/${employerId}/verify`,
                {
                    status: status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                'Employer status update:',
                res.data
            );

            // Update UI immediately
            setEmployers((previousEmployers) =>
                previousEmployers.map((emp) =>
                    emp.id === employerId
                        ? {
                              ...emp,
                              verification_status: status
                          }
                        : emp
                )
            );

            alert(
                status === 'Verified'
                    ? 'Employer verified successfully.'
                    : 'Employer rejected successfully.'
            );

        } catch (err) {
            console.error(
                'Failed to update employer:',
                err.response?.data || err.message
            );

            alert(
                err.response?.data?.message ||
                'Failed to update employer status.'
            );
        } finally {
            setActionLoading(null);
        }
    };

    // =====================================================
    // STATUS BADGE
    // =====================================================

    const getStatusBadge = (status) => {
        const currentStatus =
            (status || 'Pending').toLowerCase();

        if (currentStatus === 'verified') {
            return (
                <span className="badge bg-success">
                    Verified
                </span>
            );
        }

        if (currentStatus === 'rejected') {
            return (
                <span className="badge bg-danger">
                    Rejected
                </span>
            );
        }

        return (
            <span className="badge bg-warning text-dark">
                Pending
            </span>
        );
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="container py-4">
                <h2 className="fw-bold mb-4">
                    Manage Employers
                </h2>

                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>

                    <p className="mt-2 text-muted">
                        Loading employers...
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="container py-4">

            <h2 className="fw-bold mb-4">
                Manage Employers
            </h2>

            <div className="table-responsive shadow-sm rounded-4">

                <table className="table table-hover align-middle mb-0">

                    <thead className="table-dark">
                        <tr>
                            <th>#</th>

                            <th>
                                Company / Name
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        {employers.length > 0 ? (

                            employers.map((emp, index) => {

                                const status =
                                    (
                                        emp.verification_status ||
                                        emp.status ||
                                        'Pending'
                                    ).toLowerCase();

                                const isProcessing =
                                    actionLoading === emp.id;

                                return (
                                    <tr
                                        key={
                                            emp.id ||
                                            emp._id ||
                                            index
                                        }
                                    >

                                        {/* NUMBER */}
                                        <td>
                                            {index + 1}
                                        </td>

                                        {/* COMPANY NAME */}
                                        <td>
                                            <strong>
                                                {
                                                    emp.company_name ||
                                                    emp.name ||
                                                    emp.user_name ||
                                                    'N/A'
                                                }
                                            </strong>
                                        </td>

                                        {/* EMAIL */}
                                        <td>
                                            {
                                                emp.company_email ||
                                                emp.user_email ||
                                                emp.email ||
                                                'N/A'
                                            }
                                        </td>

                                        {/* STATUS */}
                                        <td>
                                            {getStatusBadge(
                                                emp.verification_status ||
                                                emp.status
                                            )}
                                        </td>

                                        {/* ACTION */}
                                        <td>

                                            {isProcessing ? (

                                                <div className="d-flex align-items-center gap-2">

                                                    <div
                                                        className="spinner-border spinner-border-sm text-primary"
                                                        role="status"
                                                    ></div>

                                                    <span className="text-muted">
                                                        Updating...
                                                    </span>

                                                </div>

                                            ) : (

                                                <div className="d-flex gap-2">

                                                    {/* VERIFY */}
                                                    {status !== 'verified' && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-success btn-sm"
                                                            onClick={() =>
                                                                updateEmployerStatus(
                                                                    emp.id,
                                                                    'Verified'
                                                                )
                                                            }
                                                        >
                                                            ✓ Verify
                                                        </button>
                                                    )}

                                                    {/* REJECT */}
                                                    {status !== 'rejected' && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                updateEmployerStatus(
                                                                    emp.id,
                                                                    'Rejected'
                                                                )
                                                            }
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    )}

                                                </div>

                                            )}

                                        </td>

                                    </tr>
                                );
                            })

                        ) : (

                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center py-4 text-muted"
                                >
                                    No employers found.
                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default AdminEmployers;