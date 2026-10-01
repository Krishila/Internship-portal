
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
      <section className="welcome-section">
        <h1>Welcome back, {name}!</h1>
        <p>
          Find internship opportunities and
          track your applications in one place.
        </p>

        <button onClick={onBrowseInternships}>
          Browse Internships
        </button>
      </section>

      <h2>Quick Access</h2>

      <div className="home-quick-links">
        <button onClick={onViewApplications}>
          My Applications
        </button>

        <button onClick={onViewNotifications}>
          Notifications
        </button>

        <button onClick={onBrowseInternships}>
          Explore Internships
        </button>
      </div>
    </div>
  );
}