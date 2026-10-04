import React from 'react';
import './StudentHome.css';

export default function StudentHome({
  user,
  onBrowseInternships,
  onViewApplications,
  onViewNotifications
}) {
  const name =
    user?.name ||
    user?.full_name ||
    'Student';

  return (
    <div className="student-home">

      {/* =========================
          WELCOME SECTION
      ========================== */}
      <section className="welcome-section">

        <div className="welcome-content">

          <div className="welcome-text">
            <span className="welcome-label">
              STUDENT PORTAL
            </span>

            <h1>
              Welcome back, {name}!
            </h1>

            <p>
              Find internship opportunities, manage
              your applications, and stay updated
              with your latest notifications.
            </p>

            <button
              className="browse-main-btn"
              onClick={onBrowseInternships}
            >
              <span>🔎</span>
              Browse Internships
              <span className="arrow">→</span>
            </button>
          </div>

          <div className="welcome-decoration">
            <div className="welcome-circle circle-one"></div>
            <div className="welcome-circle circle-two"></div>

            <div className="welcome-icon">
              🎓
            </div>
          </div>

        </div>

      </section>


      {/* =========================
          QUICK ACCESS
      ========================== */}
      <section className="quick-access-section">

        <div className="section-heading">
          <div>
            <h2>Quick Access</h2>

            <p>
              Access your important student activities quickly.
            </p>
          </div>
        </div>


        <div className="home-quick-links">

          {/* My Applications */}
          <button
            className="quick-card"
            onClick={onViewApplications}
          >
            <div className="quick-card-icon applications-icon">
              📄
            </div>

            <div className="quick-card-content">
              <h3>My Applications</h3>

              <p>
                View and track your internship applications.
              </p>

              <span className="quick-card-link">
                View Applications →
              </span>
            </div>
          </button>


          {/* Notifications */}
          <button
            className="quick-card"
            onClick={onViewNotifications}
          >
            <div className="quick-card-icon notification-icon">
              🔔
            </div>

            <div className="quick-card-content">
              <h3>Notifications</h3>

              <p>
                Check your latest updates and notifications.
              </p>

              <span className="quick-card-link">
                View Notifications →
              </span>
            </div>
          </button>


          {/* Explore Internships */}
          <button
            className="quick-card"
            onClick={onBrowseInternships}
          >
            <div className="quick-card-icon internship-icon">
              💼
            </div>

            <div className="quick-card-content">
              <h3>Explore Internships</h3>

              <p>
                Discover internship opportunities that match
                your interests.
              </p>

              <span className="quick-card-link">
                Explore Now →
              </span>
            </div>
          </button>

        </div>

      </section>


      {/* =========================
          STUDENT TIPS
      ========================== */}
      <section className="student-info-section">

        <div className="info-card">

          <div className="info-icon">
            💡
          </div>

          <div>
            <h3>Make the most of your internship search</h3>

            <p>
              Keep your profile updated, explore new
              opportunities regularly, and track your
              applications from the dashboard.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}