import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [accountType, setAccountType] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',

    // Student details
    phone: '',
    address: '',
    college: '',
    course: '',
    semester: '',

    // Employer details
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    description: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);


  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setErrorMessage('');
  };


  // ==========================================
  // HANDLE ACCOUNT TYPE
  // ==========================================
  const handleAccountType = (type) => {
    setAccountType(type);
    setErrorMessage('');
  };


  // ==========================================
  // HANDLE REGISTER
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountType) {
      setErrorMessage('Please select Student or Employer.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = {
        ...formData,

        // IMPORTANT:
        // Backend expects lowercase role
        role: accountType
      };

      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        data
      );

      alert(
        response.data?.message ||
        'Registration successful!'
      );

      // Go to login
      onRegisterSuccess();

    } catch (err) {
      console.error('Registration error:', err);

      setErrorMessage(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="row justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >

      <div className="col-12 col-md-8 col-lg-6">

        <div className="card shadow-lg border-0 rounded-4 mt-5">

          <div className="card-body p-4 p-sm-5">

            {/* ==========================================
                TITLE
            ========================================== */}

            <div className="text-center mb-4">

              <h3 className="fw-bold text-dark">
                Create Account
              </h3>

              <p className="text-muted">
                Register for the Internship Portal
              </p>

            </div>


            {/* ==========================================
                ERROR MESSAGE
            ========================================== */}

            {errorMessage && (
              <div className="alert alert-danger">
                {errorMessage}
              </div>
            )}


            {/* ==========================================
                ACCOUNT TYPE
            ========================================== */}

            <div className="mb-4">

              <label className="form-label fw-semibold">
                Register As
              </label>

              <div className="d-flex gap-3">

                {/* STUDENT BUTTON */}

                <button
                  type="button"
                  className={`btn w-50 ${
                    accountType === 'student'
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  }`}
                  onClick={() =>
                    handleAccountType('student')
                  }
                >
                  Student
                </button>


                {/* EMPLOYER BUTTON */}

                <button
                  type="button"
                  className={`btn w-50 ${
                    accountType === 'employer'
                      ? 'btn-success'
                      : 'btn-outline-success'
                  }`}
                  onClick={() =>
                    handleAccountType('employer')
                  }
                >
                  Employer
                </button>

              </div>

            </div>


            {/* ==========================================
                REGISTRATION FORM
            ========================================== */}

            {accountType && (

              <form onSubmit={handleSubmit}>

                {/* ======================================
                    NAME
                ====================================== */}

                <div className="mb-3">

                  <label
                    className="form-label fw-semibold"
                    htmlFor="name"
                  >
                    {accountType === 'student'
                      ? 'Full Name'
                      : 'Contact Person Name'}
                  </label>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* ======================================
                    EMAIL
                ====================================== */}

                <div className="mb-3">

                  <label
                    className="form-label fw-semibold"
                    htmlFor="email"
                  >
                    Email Address
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* ======================================
                    PASSWORD
                ====================================== */}

                <div className="mb-3">

                  <label
                    className="form-label fw-semibold"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <div className="input-group">

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      id="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>

                  </div>

                  <small className="text-muted">
                    Password must be at least 6 characters.
                  </small>

                </div>


                {/* ==========================================
                    STUDENT FIELDS
                ========================================== */}

                {accountType === 'student' && (

                  <>

                    {/* PHONE */}

                    <div className="mb-3">

                      <label
                        className="form-label fw-semibold"
                        htmlFor="phone"
                      >
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    {/* ADDRESS */}

                    <div className="mb-3">

                      <label
                        className="form-label fw-semibold"
                        htmlFor="address"
                      >
                        Address
                      </label>

                      <input
                        type="text"
                        id="address"
                        name="address"
                        className="form-control"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={handleChange}
                      />

                    </div>


                    {/* COLLEGE */}

                    <div className="mb-3">

                      <label
                        className="form-label fw-semibold"
                        htmlFor="college"
                      >
                        College
                      </label>

                      <input
                        type="text"
                        id="college"
                        name="college"
                        className="form-control"
                        placeholder="Enter college name"
                        value={formData.college}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    {/* COURSE + SEMESTER */}

                    <div className="row">

                      <div className="col-md-7 mb-3">

                        <label
                          className="form-label fw-semibold"
                          htmlFor="course"
                        >
                          Course
                        </label>

                        <input
                          type="text"
                          id="course"
                          name="course"
                          className="form-control"
                          placeholder="e.g. BIM"
                          value={formData.course}
                          onChange={handleChange}
                          required
                        />

                      </div>


                      <div className="col-md-5 mb-3">

                        <label
                          className="form-label fw-semibold"
                          htmlFor="semester"
                        >
                          Semester
                        </label>

                        <input
                          type="number"
                          id="semester"
                          name="semester"
                          className="form-control"
                          placeholder="e.g. 6"
                          min="1"
                          max="8"
                          value={formData.semester}
                          onChange={handleChange}
                          required
                        />

                      </div>

                    </div>

                  </>

                )}


                {/* ==========================================
                    EMPLOYER FIELDS
                ========================================== */}

                {accountType === 'employer' && (

                  <>

                    {/* COMPANY NAME */}

                    <div className="mb-3">

                      <label
                        className="form-label fw-semibold"
                        htmlFor="companyName"
                      >
                        Company Name
                      </label>

                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        className="form-control"
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    {/* COMPANY ADDRESS */}

                    <div className="mb-3">

                      <label
                        className="form-label fw-semibold"
                        htmlFor="companyAddress"
                      >
                        Company Address
                      </label>

                      <input
                        type="text"
                        id="companyAddress"
                        name="companyAddress"
                        className="form-control"
                        placeholder="Enter company address"
                        value={formData.companyAddress}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    {/* COMPANY PHONE */}

                    <div className="mb-3">

                      <label
                        className="form-label fw-semibold"
                        htmlFor="companyPhone"
                      >
                        Company Phone
                      </label>

                      <input
                        type="tel"
                        id="companyPhone"
                        name="companyPhone"
                        className="form-control"
                        placeholder="Enter company phone"
                        value={formData.companyPhone}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    {/* COMPANY EMAIL */}

                    <div className="mb-3">

                      <label
                        className="form-label fw-semibold"
                        htmlFor="companyEmail"
                      >
                        Company Email
                      </label>

                      <input
                        type="email"
                        id="companyEmail"
                        name="companyEmail"
                        className="form-control"
                        placeholder="company@example.com"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="mb-3">

                      <label
                        className="form-label fw-semibold"
                        htmlFor="description"
                      >
                        Company Description
                      </label>

                      <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        rows="3"
                        placeholder="Describe your company"
                        value={formData.description}
                        onChange={handleChange}
                      />

                    </div>

                  </>

                )}


                {/* ==========================================
                    REGISTER BUTTON
                ========================================== */}

                <button
                  type="submit"
                  className={`btn ${
                    accountType === 'student'
                      ? 'btn-primary'
                      : 'btn-success'
                  } btn-lg w-100 fw-bold mt-3`}
                  disabled={loading}
                >

                  {loading
                    ? 'Creating Account...'
                    : 'Register'}

                </button>

              </form>

            )}


            {/* ==========================================
                LOGIN LINK
            ========================================== */}

            <div className="text-center mt-4">

              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={onSwitchToLogin}
              >
                Already have an account? Login
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;