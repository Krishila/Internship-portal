import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployerPostedJobs.css';

function EmployerPostedJobs() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // NEW: Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const token = localStorage.getItem('token');

  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  const userId = user?.id;

  useEffect(() => {
    fetchPostedInternships();
  }, []);

  const fetchPostedInternships = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        'http://localhost:5000/api/internships',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.internships || [];

      // Employer ले post गरेको मात्र
      const myInternships = data.filter(
        (internship) =>
          Number(internship.posted_by) === Number(userId)
      );

      setInternships(myInternships);
    } catch (err) {
      console.error(
        'Error fetching posted internships:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to load posted internships.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTER INTERNSHIPS
  // ==========================================

  const filteredInternships = internships.filter(
    (internship) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        internship.title
          ?.toLowerCase()
          .includes(search) ||
        internship.company
          ?.toLowerCase()
          .includes(search) ||
        internship.location
          ?.toLowerCase()
          .includes(search);

      const isApproved =
        Number(internship.is_approved) === 1;

      const currentStatus = isApproved
        ? 'Approved'
        : 'Pending';

      const matchesStatus =
        statusFilter === 'All' ||
        currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  // ==========================================
  // COUNTS
  // ==========================================

  const approvedCount = internships.filter(
    (internship) =>
      Number(internship.is_approved) === 1
  ).length;

  const pendingCount =
    internships.length - approvedCount;

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="employer-posted-container">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="posted-dashboard-header">

        <div>
          <h1>Employer Dashboard</h1>

          <p>
            Manage your posted internship opportunities.
          </p>
        </div>

      </div>


      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (
        <div className="posted-loading">
          <div className="posted-spinner"></div>

          <p>
            Loading your posted internships...
          </p>
        </div>
      )}


      {/* ==========================================
          ERROR
      ========================================== */}

      {!loading && error && (
        <div className="posted-error">
          {error}
        </div>
      )}


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      {!loading && !error && (
        <>

          {/* ========================================
              SUMMARY CARDS
          ======================================== */}

          <div className="posted-summary">

            <div className="summary-card">
              <div className="summary-icon">
                📋
              </div>

              <div>
                <span>Total Internships</span>
                <strong>{internships.length}</strong>
              </div>
            </div>


            <div className="summary-card approved-summary">
              <div className="summary-icon">
                ✓
              </div>

              <div>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
              </div>
            </div>


            <div className="summary-card pending-summary">
              <div className="summary-icon">
                ⏳
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

          </div>


          {/* ========================================
              SECTION HEADER
          ======================================== */}

          <div className="posted-section-header">

            <div>
              <h2>Your Posted Internships</h2>

              <p>
                View and manage your internship opportunities.
              </p>
            </div>

            <div className="posted-total">
              Total: <strong>{internships.length}</strong>
            </div>

          </div>


          {/* ========================================
              SEARCH & FILTER
          ======================================== */}

          {internships.length > 0 && (
            <div className="posted-controls">

              <div className="posted-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search by title, company or location..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>


              <div className="posted-filter">

                <label htmlFor="statusFilter">
                  Status
                </label>

                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All
                  </option>

                  <option value="Approved">
                    Approved
                  </option>

                  <option value="Pending">
                    Pending
                  </option>
                </select>

              </div>

            </div>
          )}


          {/* ========================================
              NO POSTED JOB
          ======================================== */}

          {internships.length === 0 && (
            <div className="posted-empty">

              <div className="empty-icon">
                📄
              </div>

              <h3>
                No Internships Posted
              </h3>

              <p>
                You have not posted any internship
                opportunities yet.
              </p>

            </div>
          )}


          {/* ========================================
              NO SEARCH RESULT
          ======================================== */}

          {internships.length > 0 &&
            filteredInternships.length === 0 && (
              <div className="posted-empty">

                <div className="empty-icon">
                  🔍
                </div>

                <h3>
                  No Internships Found
                </h3>

                <p>
                  Try changing your search or status filter.
                </p>

              </div>
            )}


          {/* ========================================
              POSTED JOBS
          ======================================== */}

          {filteredInternships.length > 0 && (
            <div className="posted-jobs-grid">

              {filteredInternships.map(
                (internship) => {

                  const isApproved =
                    Number(internship.is_approved) === 1;

                  return (
                    <div
                      className="posted-job-card"
                      key={internship.id}
                    >

                      {/* CARD TOP */}

                      <div className="job-card-top">

                        <div className="job-title-area">

                          <h3>
                            {internship.title}
                          </h3>

                          <span className="job-company">
                            {internship.company || 'N/A'}
                          </span>

                        </div>

                        <span
                          className={
                            isApproved
                              ? 'job-status approved'
                              : 'job-status pending'
                          }
                        >
                          <span className="status-dot"></span>

                          {isApproved
                            ? 'Approved'
                            : 'Pending'}
                        </span>

                      </div>


                      {/* CARD DETAILS */}

                      <div className="job-details">

                        <div className="job-detail">

                          <span className="detail-label">
                            Location
                          </span>

                          <strong>
                            {internship.location || 'N/A'}
                          </strong>

                        </div>


                        <div className="job-detail">

                          <span className="detail-label">
                            Stipend
                          </span>

                          <strong>
                            {internship.stipend || 'N/A'}
                          </strong>

                        </div>


                        <div className="job-detail">

                          <span className="detail-label">
                            Application Deadline
                          </span>

                          <strong>
                            {formatDate(
                              internship.deadline
                            )}
                          </strong>

                        </div>

                      </div>


                      {/* DESCRIPTION */}

                      {internship.description && (
                        <div className="job-description">

                          <span className="detail-label">
                            Description
                          </span>

                          <p>
                            {internship.description}
                          </p>

                        </div>
                      )}


                      {/* CARD FOOTER */}

                      <div className="job-card-footer">

                        <span>
                          Internship Opportunity
                        </span>

                        <span className="posted-indicator">
                          ● Posted
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </>
      )}

    </div>
  );
}

export default EmployerPostedJobs;