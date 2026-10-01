import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 py-3 shadow-sm mb-4">
            <Link className="navbar-brand fw-bold" to="/admin/dashboard">Internship Portal (Admin)</Link>
            <div className="collapse navbar-collapse justify-content-end">
                <ul className="navbar-nav align-items-center">
                    <li className="nav-item mx-2">
                        <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item ms-3">
                        <button onClick={handleLogout} className="btn btn-danger btn-sm px-3">Logout</button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

const AdminPanel = () => {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(
        'http://localhost:5000/api/admin/pending',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPendingListings(res.data);
    } catch (err) {
      console.error(
        'Failed to fetch pending listings:',
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
      try {
        const token = localStorage.getItem('token');
  
       
        await axios.put(
          `http://localhost:5000/api/internships/approve/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
  
        setPendingListings(
          pendingListings.filter((item) => (item.id || item._id) !== id)
        );
  
        alert('Listing approved successfully!');
      } catch (err) {
        console.error(
          'Approval error:',
          err.response?.data || err.message
        );
  
        alert('Failed to approve listing');
      }
    };

  return (
    <div>
      
      <AdminNavbar />

      <div className="container py-4">
        <h2 className="fw-bold mb-4">
          Admin Verification Gateway
        </h2>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>
          </div>
        ) : (
          <div className="table-responsive shadow-sm rounded-4">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Deadline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingListings.length > 0 ? (
                  pendingListings.map((item, index) => {
                    const itemId = item.id || item._id;
                    return (
                      <tr key={itemId}>
                        <td>{index + 1}</td>
                        <td>{item.company || 'N/A'}</td>
                        <td>{item.title || 'N/A'}</td>
                        <td>
                          {item.deadline
                            ? new Date(item.deadline).toLocaleDateString()
                            : 'No Deadline'}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-success fw-bold"
                            onClick={() => handleApprove(itemId)}
                          >
                            Approve Listing
                          </button>
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
                      No pending job listings to verify.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;