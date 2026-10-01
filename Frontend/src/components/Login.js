import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        formData
      );

      if (!res.data.token || !res.data.user) {
        setError('Invalid server response structure.');
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center min-vh-100">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card border-0 shadow-lg rounded-4 p-4">
          <div className="card-body">
            <h3 className="fw-bold text-center mb-1">
              Welcome!!
            </h3>
            <p className="text-muted text-center small mb-4">
              Login to your Internship Portal account
            </p>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  autoComplete="off"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold rounded-3 mb-3"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="text-center small text-muted">
              Don't have an account?{' '}
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none fw-bold"
                onClick={onSwitchToRegister}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;