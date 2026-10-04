import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Login from './components/Login';
import Register from './components/Register';
import Internships from './components/Internships';
import MyApplications from './components/MyApplications';
import ApplyForm from './components/ApplyForm';

import AdminPanel from './components/AdminVerification';
import AdminDashboard from './components/AdminDashboard';

import EmployerDashboard from './components/EmployerDashboard';
import EmployerPostedJobs from './components/EmployerPostedJobs';

import Notifications from './components/Notifications';
import StudentHome from './components/StudentHome';

import AdminUsers from './components/AdminUsers';
import AdminEmployers from './components/AdminEmployers';


// =====================================================
// ADMIN APPLICATIONS
// =====================================================

function AdminApplications() {

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ===================================================
  // FETCH ALL APPLICATIONS
  // ===================================================

  const fetchApplications = async () => {

    try {

      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Admin login session not found.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://localhost:5000/api/admin/applications',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        'Admin applications response:',
        response.data
      );

      /*
        Backend response:

        {
          success: true,
          applications: [...]
        }
      */

      const applicationData =
        response.data?.applications || [];

      setApplications(applicationData);

    } catch (err) {

      console.error(
        'Admin applications error:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load applications.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ===================================================
  // LOAD ON PAGE OPEN
  // ===================================================

  useEffect(() => {

    fetchApplications();

  }, []);


  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (date) => {

    if (!date) {
      return 'N/A';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleDateString();

  };


  // ===================================================
  // STATUS BADGE
  // ===================================================

  const getStatusBadge = (status) => {

    const normalized =
      String(status || 'Pending').toLowerCase();


    if (normalized === 'accepted') {

      return (
        <span className="badge bg-success">
          Accepted
        </span>
      );

    }


    if (normalized === 'rejected') {

      return (
        <span className="badge bg-danger">
          Rejected
        </span>
      );

    }


    if (normalized === 'shortlisted') {

      return (
        <span className="badge bg-info text-dark">
          Shortlisted
        </span>
      );

    }


    if (
      normalized === 'under review' ||
      normalized === 'review'
    ) {

      return (
        <span className="badge bg-warning text-dark">
          Under Review
        </span>
      );

    }


    if (normalized === 'submitted') {

      return (
        <span className="badge bg-primary">
          Submitted
        </span>
      );

    }


    return (
      <span className="badge bg-secondary">
        Pending
      </span>
    );

  };


  // ===================================================
  // VIEW RESUME
  // ===================================================

  const handleViewResume = (resume) => {

    if (!resume) {
      alert('Resume/CV not available.');
      return;
    }

    /*
      Base64 resume
    */

    if (
      typeof resume === 'string' &&
      resume.startsWith('data:')
    ) {

      const newWindow =
        window.open();

      if (newWindow) {

        newWindow.document.write(`
          <html>
            <head>
              <title>Resume / CV</title>
            </head>

            <body
              style="
                margin:0;
                padding:20px;
                text-align:center;
                background:#f5f5f5;
              "
            >
              <img
                src="${resume}"
                style="
                  max-width:100%;
                  max-height:95vh;
                  object-fit:contain;
                "
              />
            </body>
          </html>
        `);

        newWindow.document.close();

      }

      return;
    }


    /*
      Normal URL
    */

    if (
      typeof resume === 'string' &&
      (
        resume.startsWith('http://') ||
        resume.startsWith('https://')
      )
    ) {

      window.open(
        resume,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }


    /*
      Backend uploaded file
    */

    window.open(
      `http://localhost:5000/uploads/${resume}`,
      '_blank',
      'noopener,noreferrer'
    );

  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <div className="container py-4">

        <h2 className="fw-bold">
          All Applications
        </h2>

        <p className="text-muted">
          Overview of student internship applications.
        </p>

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="mt-3 text-muted">
            Loading applications...
          </p>

        </div>

      </div>
    );

  }


  // ===================================================
  // PAGE
  // ===================================================

  return (

    <div className="container py-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            All Applications
          </h2>

          <p className="text-muted mb-0">
            Overview of student internship applications.
          </p>

        </div>


        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={fetchApplications}
        >
          🔄 Refresh
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* =================================================
          APPLICATION COUNT
      ================================================= */}

      {!error && (

        <div className="mb-3">

          <span className="badge bg-dark fs-6">

            Total Applications: {applications.length}

          </span>

        </div>

      )}


      {/* =================================================
          APPLICATION TABLE
      ================================================= */}

      {!error && (

        <div className="card border-0 shadow-sm">

          <div className="card-body p-0">

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">

                  <tr>

                    <th>#</th>

                    <th>Candidate</th>

                    <th>Email</th>

                    <th>Phone</th>

                    <th>Education</th>

                    <th>GPA</th>

                    <th>Skills</th>

                    <th>Experience</th>

                    <th>Internship</th>

                    <th>Company</th>

                    <th>Applied</th>

                    <th>Resume</th>

                    <th>Status</th>

                  </tr>

                </thead>


                <tbody>

                  {applications.length > 0 ? (

                    applications.map(
                      (application, index) => (

                        <tr
                          key={
                            application.id ||
                            application.application_id ||
                            index
                          }
                        >

                          {/* NUMBER */}

                          <td>
                            {index + 1}
                          </td>


                          {/* CANDIDATE */}

                          <td>

                            <strong>
                              {
                                application.candidate ||
                                application.student_name ||
                                application.full_name ||
                                'N/A'
                              }
                            </strong>

                          </td>


                          {/* EMAIL */}

                          <td>

                            {
                              application.email ||
                              application.student_email ||
                              'N/A'
                            }

                          </td>


                          {/* PHONE */}

                          <td>

                            {
                              application.phone ||
                              'N/A'
                            }

                          </td>


                          {/* EDUCATION */}

                          <td>

                            {
                              application.education ||
                              'N/A'
                            }

                          </td>


                          {/* GPA */}

                          <td>

                            {
                              application.gpa !== null &&
                              application.gpa !== undefined &&
                              application.gpa !== ''
                                ? application.gpa
                                : 'N/A'
                            }

                          </td>


                          {/* SKILLS */}

                          <td>

                            <div
                              style={{
                                maxWidth: '180px',
                                whiteSpace: 'normal'
                              }}
                            >

                              {
                                application.skills ||
                                'N/A'
                              }

                            </div>

                          </td>


                          {/* EXPERIENCE */}

                          <td>

                            <div
                              style={{
                                maxWidth: '180px',
                                whiteSpace: 'normal'
                              }}
                            >

                              {
                                application.experience ||
                                'N/A'
                              }

                            </div>

                          </td>


                          {/* INTERNSHIP */}

                          <td>

                            <strong>

                              {
                                application.internship ||
                                application.internship_title ||
                                'N/A'
                              }

                            </strong>

                          </td>


                          {/* COMPANY */}

                          <td>

                            {
                              application.company ||
                              'N/A'
                            }

                          </td>


                          {/* APPLIED DATE */}

                          <td>

                            {
                              formatDate(
                                application.applied_date ||
                                application.applied_at
                              )
                            }

                          </td>


                          {/* RESUME */}

                          <td>

                            {
                              application.resume_link
                                ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      handleViewResume(
                                        application.resume_link
                                      )
                                    }
                                  >
                                    View CV
                                  </button>
                                )
                                : (
                                  <span className="text-muted">
                                    N/A
                                  </span>
                                )
                            }

                          </td>


                          {/* STATUS */}

                          <td>

                            {
                              getStatusBadge(
                                application.status
                              )
                            }

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="13"
                        className="text-center py-5"
                      >

                        <div
                          style={{
                            fontSize: '45px'
                          }}
                        >
                          📄
                        </div>

                        <h5 className="mt-3">
                          No Applications Found
                        </h5>

                        <p className="text-muted mb-0">
                          No student has applied for an
                          internship yet.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {

  // ===================================================
  // GET STORED USER
  // ===================================================

  const getStoredUser = () => {

    try {

      const token =
        localStorage.getItem('token');

      const user =
        JSON.parse(
          localStorage.getItem('user') || 'null'
        );

      if (!token || !user) {

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        return null;
      }

      return user;

    } catch {

      return null;

    }

  };


  const storedToken =
    localStorage.getItem('token');

  const storedUser =
    getStoredUser();


  // ===================================================
  // LOGIN STATE
  // ===================================================

  const [isLoggedIn, setIsLoggedIn] =
    useState(
      !!storedToken && !!storedUser
    );


  const [currentUser, setCurrentUser] =
    useState(storedUser);


  // ===================================================
  // INITIAL VIEW
  // ===================================================

  const [view, setView] = useState(() => {

    if (!storedToken || !storedUser) {
      return 'login';
    }

    const role =
      (
        storedUser.role || ''
      ).toLowerCase();


    if (role === 'student') {
      return 'home';
    }


    if (role === 'employer') {
      return 'employer-posted-jobs';
    }


    if (role === 'admin') {
      return 'admin-dashboard';
    }


    return 'login';

  });


  // ===================================================
  // VIEW HISTORY
  // ===================================================

  const [viewHistory, setViewHistory] =
    useState([]);


  const navigateTo = (nextView) => {

    if (nextView === view) {
      return;
    }

    setViewHistory((previous) => [

      ...previous,

      view

    ]);

    setView(nextView);

  };


  // ===================================================
  // BACK
  // ===================================================

  const handleBack = () => {

    if (viewHistory.length > 0) {

      const previousView =
        viewHistory[
          viewHistory.length - 1
        ];

      setViewHistory(
        (previous) =>
          previous.slice(0, -1)
      );

      setView(previousView);

      return;
    }


    if (isStudent) {

      setView('home');

    } else if (isEmployer) {

      setView(
        'employer-posted-jobs'
      );

    } else if (isAdmin) {

      setView(
        'admin-dashboard'
      );

    }

  };


  // ===================================================
  // SELECTED INTERNSHIP
  // ===================================================

  const [selectedInternship, setSelectedInternship] =
    useState(null);


  // ===================================================
  // ROLE
  // ===================================================

  const role =
    (
      currentUser?.role || ''
    ).toLowerCase();


  const isStudent =
    role === 'student';

  const isEmployer =
    role === 'employer';

  const isAdmin =
    role === 'admin';


  // ===================================================
  // LOGIN SUCCESS
  // ===================================================

  const handleLoginSuccess = (loggedInUser) => {

    const user =
      loggedInUser ||
      JSON.parse(
        localStorage.getItem('user') || 'null'
      );


    if (!user) {

      alert('User data missing.');

      return;

    }


    setCurrentUser(user);

    setIsLoggedIn(true);

    setViewHistory([]);


    const userRole =
      (
        user.role || ''
      ).toLowerCase();


    if (userRole === 'student') {

      setView('home');

    } else if (userRole === 'employer') {

      setView(
        'employer-posted-jobs'
      );

    } else if (userRole === 'admin') {

      setView(
        'admin-dashboard'
      );

    } else {

      alert('Invalid user role.');

      handleLogout();

    }

  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setCurrentUser(null);
    setIsLoggedIn(false);

    setView('login');

    setViewHistory([]);

    setSelectedInternship(null);

  };


  // ===================================================
  // REGISTER
  // ===================================================

  const handleRegisterSuccess = () => {

    setView('login');

  };


  // ===================================================
  // APPLY
  // ===================================================

  const handleApplyClick = (internship) => {

    setSelectedInternship(internship);

    navigateTo('apply');

  };


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div className="App">


      {/* =================================================
          NAVBAR
      ================================================= */}

      {isLoggedIn && (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 px-4 shadow-sm">

          <div className="container-fluid">


            {/* LOGO */}

            <span
              className="navbar-brand fw-bold"
              style={{
                cursor: 'pointer'
              }}
              onClick={() => {

                if (isStudent) {

                  navigateTo('home');

                } else if (isEmployer) {

                  navigateTo(
                    'employer-posted-jobs'
                  );

                } else if (isAdmin) {

                  navigateTo(
                    'admin-dashboard'
                  );

                }

              }}
            >

              Internship Portal


              {isAdmin && (

                <span className="badge bg-danger ms-2 font-monospace">

                  Admin

                </span>

              )}

            </span>


            {/* NAVIGATION */}

            <div className="collapse navbar-collapse justify-content-end">

              <div className="navbar-nav align-items-center">


                {/* =================================================
                    STUDENT
                ================================================= */}

                {isStudent && (
                  <>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo('home')
                      }
                    >
                      Home
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo('internships')
                      }
                    >
                      Internships
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo('applications')
                      }
                    >
                      My Applications
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo('notifications')
                      }
                    >
                      Notifications
                    </button>

                  </>
                )}


                {/* =================================================
                    EMPLOYER
                ================================================= */}

                {isEmployer && (
                  <>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo(
                          'employer-posted-jobs'
                        )
                      }
                    >
                      Dashboard
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo('internships')
                      }
                    >
                      Internships
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo(
                          'employer-dashboard'
                        )
                      }
                    >
                      Applicants
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo('notifications')
                      }
                    >
                      Notifications
                    </button>

                  </>
                )}


                {/* =================================================
                    ADMIN
                ================================================= */}

                {isAdmin && (
                  <>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo(
                          'admin-dashboard'
                        )
                      }
                    >
                      Dashboard
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo(
                          'admin-employers'
                        )
                      }
                    >
                      Companies
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo(
                          'admin-verification'
                        )
                      }
                    >
                      Internships
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo(
                          'admin-users'
                        )
                      }
                    >
                      Users
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo(
                          'admin-applications'
                        )
                      }
                    >
                      Applications
                    </button>


                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() =>
                        navigateTo(
                          'notifications'
                        )
                      }
                    >
                      Notifications
                    </button>

                  </>
                )}


                {/* LOGOUT */}

                <button
                  className="btn btn-danger btn-sm ms-3 px-3"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>

            </div>

          </div>

        </nav>

      )}


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="container">


        {/* BACK BUTTON */}

        {isLoggedIn &&
          view !== 'home' && (

            <button
              type="button"
              className="back-arrow"
              onClick={handleBack}
              aria-label="Go back"
              title="Go back"
            >
              ←
            </button>

          )}


        {/* =================================================
            LOGIN / REGISTER
        ================================================= */}

        {!isLoggedIn ? (

          view === 'register' ? (

            <Register
              onRegisterSuccess={
                handleRegisterSuccess
              }
              onSwitchToLogin={() =>
                setView('login')
              }
            />

          ) : (

            <Login
              onLoginSuccess={
                handleLoginSuccess
              }
              onSwitchToRegister={() =>
                setView('register')
              }
            />

          )

        ) : (

          <>


            {/* =================================================
                STUDENT HOME
            ================================================= */}

            {view === 'home' &&
              isStudent && (

                <StudentHome
                  user={currentUser}

                  onBrowseInternships={() =>
                    navigateTo(
                      'internships'
                    )
                  }

                  onViewApplications={() =>
                    navigateTo(
                      'applications'
                    )
                  }

                  onViewNotifications={() =>
                    navigateTo(
                      'notifications'
                    )
                  }
                />

              )}


            {/* =================================================
                INTERNSHIPS
            ================================================= */}

            {view === 'internships' &&
              (isStudent ||
                isEmployer) && (

                <Internships
                  onApplyClick={
                    handleApplyClick
                  }
                />

              )}


            {/* =================================================
                STUDENT APPLICATIONS
            ================================================= */}

            {view === 'applications' &&
              isStudent && (

                <MyApplications />

              )}


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {view === 'notifications' &&
              (
                isStudent ||
                isEmployer ||
                isAdmin
              ) && (

                <Notifications />

              )}


            {/* =================================================
                APPLY FORM
            ================================================= */}

            {view === 'apply' &&
              isStudent && (

                <ApplyForm

                  internship={
                    selectedInternship
                  }

                  onCancel={() =>
                    navigateTo(
                      'internships'
                    )
                  }

                  onSuccess={() =>
                    navigateTo(
                      'applications'
                    )
                  }

                />

              )}


            {/* =================================================
                EMPLOYER POSTED JOBS
            ================================================= */}

            {view ===
              'employer-posted-jobs' &&
              isEmployer && (

                <EmployerPostedJobs />

              )}


            {/* =================================================
                EMPLOYER APPLICANTS
            ================================================= */}

            {view ===
              'employer-dashboard' &&
              isEmployer && (

                <EmployerDashboard />

              )}


            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}

            {view ===
              'admin-dashboard' &&
              isAdmin && (

                <AdminDashboard
                  onNavigate={
                    navigateTo
                  }
                />

              )}


            {/* =================================================
                ADMIN INTERNSHIP VERIFICATION
            ================================================= */}

            {view ===
              'admin-verification' &&
              isAdmin && (

                <AdminPanel />

              )}


            {/* =================================================
                ADMIN USERS
            ================================================= */}

            {view ===
              'admin-users' &&
              isAdmin && (

                <AdminUsers />

              )}


            {/* =================================================
                ADMIN EMPLOYERS
            ================================================= */}

            {view ===
              'admin-employers' &&
              isAdmin && (

                <AdminEmployers />

              )}


            {/* =================================================
                ADMIN APPLICATIONS
            ================================================= */}

            {view ===
              'admin-applications' &&
              isAdmin && (

                <AdminApplications />

              )}

          </>

        )}

      </div>

    </div>

  );

}


export default App;