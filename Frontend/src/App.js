import React, { useState } from 'react';

import Login from './components/Login';
import Register from './components/Register';
import Internships from './components/Internships';
import MyApplications from './components/MyApplications';
import ApplyForm from './components/ApplyForm';
import AdminPanel from './components/AdminVerification';
import EmployerDashboard from './components/EmployerDashboard';
import EmployerPostedJobs from './components/EmployerPostedJobs';
import Notifications from './components/Notifications';
import StudentHome from './components/StudentHome';

import AdminUsers from './components/AdminUsers';
import AdminEmployers from './components/AdminEmployers';


function AdminApplications() {
  return (
    <div className="container py-4">
      <h2 className="fw-bold">
        All Applications Page
      </h2>

      <p className="text-muted">
        Overview of student internship applications.
      </p>
    </div>
  );
}


function App() {
  // GET STORED USER

  const getStoredUser = () => {
    try {
      const token = localStorage.getItem('token');

      const user = JSON.parse(
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


  const storedToken = localStorage.getItem('token');
  const storedUser = getStoredUser();


  // LOGIN STATE

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!storedToken && !!storedUser
  );

  const [currentUser, setCurrentUser] = useState(
    storedUser
  );


  // INITIAL VIEW

  const [view, setView] = useState(() => {
    if (!storedToken || !storedUser) {
      return 'login';
    }

    const role = (
      storedUser.role || ''
    ).toLowerCase();

    if (role === 'student') {
      return 'home';
    }

    if (role === 'employer') {
      return 'employer-posted-jobs';
    }

    if (role === 'admin') {
      return 'admin';
    }

    return 'login';
  });


  // PREVIOUS VIEW FOR BACK BUTTON

  const [viewHistory, setViewHistory] = useState([]);


  const navigateTo = (nextView) => {
    if (nextView === view) return;

    setViewHistory((previous) => [
      ...previous,
      view
    ]);

    setView(nextView);
  };


  const handleBack = () => {
    if (viewHistory.length > 0) {
      const previousView =
        viewHistory[viewHistory.length - 1];

      setViewHistory((previous) =>
        previous.slice(0, -1)
      );

      setView(previousView);
      return;
    }

    if (isStudent) {
      setView('home');
    } else if (isEmployer) {
      setView('employer-posted-jobs');
    } else if (isAdmin) {
      setView('admin');
    }
  };


  const [selectedInternship, setSelectedInternship] =
    useState(null);


  // USER ROLE

  const role = (
    currentUser?.role || ''
  ).toLowerCase();

  const isStudent = role === 'student';
  const isEmployer = role === 'employer';
  const isAdmin = role === 'admin';


  // LOGIN SUCCESS

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

    const userRole = (
      user.role || ''
    ).toLowerCase();

    if (userRole === 'student') {
      setView('home');
    } else if (userRole === 'employer') {
      setView('employer-posted-jobs');
    } else if (userRole === 'admin') {
      setView('admin');
    } else {
      alert('Invalid user role.');
      handleLogout();
    }
  };


  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setCurrentUser(null);
    setIsLoggedIn(false);

    setView('login');
    setViewHistory([]);
    setSelectedInternship(null);
  };


  // REGISTER SUCCESS

  const handleRegisterSuccess = () => {
    setView('login');
  };


  // APPLY CLICK

  const handleApplyClick = (internship) => {
    setSelectedInternship(internship);
    navigateTo('apply');
  };


  // MAIN UI

  return (
    <div className="App">

      {/* NAVBAR */}

      {isLoggedIn && (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 px-4 shadow-sm">
          <div className="container-fluid">

            {/* LOGO */}

            <span className="navbar-brand fw-bold">
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

                {/* STUDENT NAVBAR */}

                {isStudent && (
                  <>
                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() => navigateTo('home')}
                    >
                      Home
                    </button>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() => navigateTo('internships')}
                    >
                      Internships
                    </button>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() => navigateTo('applications')}
                    >
                      My Applications
                    </button>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() => navigateTo('notifications')}
                    >
                      Notifications
                    </button>
                  </>
                )}


                {/* EMPLOYER NAVBAR */}

                {isEmployer && (
                  <>
                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() => navigateTo('employer-posted-jobs')}
                    >
                      Dashboard
                    </button>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() => navigateTo('internships')}
                    >
                      Internships
                    </button>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() => navigateTo('employer-dashboard')}
                    >
                      Applicants
                    </button>

                    <button
                      className="btn btn-link text-light text-decoration-none me-2"
                      onClick={() => navigateTo('notifications')}
                    >
                      Notifications
                    </button>
                  </>
                )}


                {/* ADMIN NAVBAR */}

                {isAdmin && (
                  <button
                    className="btn btn-link text-light text-decoration-none me-2"
                    onClick={() => navigateTo('admin')}
                  >
                    Dashboard
                  </button>
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


      {/* MAIN CONTENT */}

      <div className="container">

        {/* BACK ARROW */}

        {isLoggedIn && view !== 'home' && (
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


        {!isLoggedIn ? (
          view === 'register' ? (
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setView('register')}
            />
          )
        ) : (
          <>

            {/* STUDENT HOME */}

            {view === 'home' && isStudent && (
              <StudentHome
                user={currentUser}
                onBrowseInternships={() =>
                  navigateTo('internships')
                }
                onViewApplications={() =>
                  navigateTo('applications')
                }
                onViewNotifications={() =>
                  navigateTo('notifications')
                }
              />
            )}


            {/* INTERNSHIPS */}

            {view === 'internships' &&
              (isStudent || isEmployer) && (
                <Internships
                  onApplyClick={handleApplyClick}
                />
              )}


            {/* STUDENT APPLICATIONS */}

            {view === 'applications' &&
              isStudent && (
                <MyApplications />
              )}


            {/* NOTIFICATIONS */}

            {view === 'notifications' &&
              (isStudent || isEmployer) && (
                <Notifications />
              )}


            {/* APPLY FORM */}

            {view === 'apply' &&
              isStudent && (
                <ApplyForm
                  internship={selectedInternship}
                  onCancel={() =>
                    navigateTo('internships')
                  }
                  onSuccess={() =>
                    navigateTo('applications')
                  }
                />
              )}


            {/* EMPLOYER DASHBOARD */}

            {view === 'employer-posted-jobs' &&
              isEmployer && (
                <EmployerPostedJobs />
              )}


            {/* EMPLOYER APPLICANTS */}

            {view === 'employer-dashboard' &&
              isEmployer && (
                <EmployerDashboard />
              )}


            {/* ADMIN */}

            {view === 'admin' &&
              isAdmin && (
                <AdminPanel />
              )}


            {/* ADMIN USERS */}

            {view === 'admin-users' &&
              isAdmin && (
                <AdminUsers />
              )}


            {/* ADMIN EMPLOYERS */}

            {view === 'admin-employers' &&
              isAdmin && (
                <AdminEmployers />
              )}


            {/* ADMIN APPLICATIONS */}

            {view === 'admin-applications' &&
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