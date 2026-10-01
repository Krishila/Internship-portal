import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please login first.');
          setLoading(false);
          return;
        }

        // STUDENT APPLICATIONS
        const res = await axios.get(
          'http://localhost:5000/api/applications/my-applications',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setApplications(res.data);
      } catch (err) {
        console.error(
          'Failed to fetch applications:',
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
          'Failed to load your applications.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // =========================
  // STATUS BADGE
  // =========================
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {

      case 'accepted':
      case 'selected':
        return (
          <span className="badge bg-success">
            Accepted
          </span>
        );

      case 'shortlisted':
        return (
          <span className="badge bg-info text-dark">
            Shortlisted
          </span>
        );

      case 'under review':
        return (
          <span className="badge bg-warning text-dark">
            Under Review
          </span>
        );

      case 'rejected':
        return (
          <span className="badge bg-danger">
            Rejected
          </span>
        );

      default:
        return (
          <span className="badge bg-primary">
            Submitted
          </span>
        );
    }
  };

  return (
    <div className="container py-4">

      {/* =========================
          PAGE TITLE
      ========================= */}
      <div className="mb-4">
        <h2 className="fw-bold">
          My Applications
        </h2>

        <p className="text-muted">
          View the internships you have applied for and their current status.
        </p>
      </div>

      {/* =========================
          LOADING
      ========================= */}
      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
          </div>

          <p className="mt-3 text-muted">
            Loading your applications...
          </p>
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}
      {!loading && error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =========================
          APPLICATION TABLE
      ========================= */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm rounded-4">

          <div className="card-header bg-dark text-white rounded-top-4">
            <h5 className="mb-0">
              Application History
            </h5>
          </div>

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>
                  <th>#</th>
                  <th>Internship</th>
                  <th>Company</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {applications.length > 0 ? (

                  applications.map((app, index) => (

                    <tr key={app.id || index}>

                      {/* NUMBER */}
                      <td>
                        {index + 1}
                      </td>

                      {/* INTERNSHIP */}
                      <td className="fw-bold">
                        {app.internship_title ||
                          app.title ||
                          'N/A'}
                      </td>

                      {/* COMPANY */}
                      <td>
                        {app.company ||
                          app.company_name ||
                          'N/A'}
                      </td>

                      {/* DATE */}
                      
                      <td>
                           {(app.applied_date || app.applied_at)
                           ? new Date(
                            app.applied_date || app.applied_at
                             ).toLocaleDateString()
                            : 'N/A'}
                      </td>
                       

                      {/* STATUS */}
                      <td>
                        {getStatusBadge(app.status)}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-5 text-muted"
                    >
                      <h5>No applications found.</h5>

                      <p className="mb-0">
                        You have not applied for any internship yet.
                      </p>
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
};

export default Applications;