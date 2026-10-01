import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminEmployers = () => {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployers();
    }, []);

    const fetchEmployers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/employers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployers(res.data);
        } catch (err) {
            console.error('Failed to fetch employers:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4">Manage Employers</h2>
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <div className="table-responsive shadow-sm rounded-4">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Company / Name</th>
                                <th>Email</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employers.length > 0 ? (
                                employers.map((emp, index) => (
                                    <tr key={emp.id || emp._id}>
                                        <td>{index + 1}</td>
                                        <td>{emp.company_name || emp.name || 'N/A'}</td>
                                        <td>{emp.email || 'N/A'}</td>
                                        <td><span className="badge bg-info text-dark">Active</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-4 text-muted">No employers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminEmployers;