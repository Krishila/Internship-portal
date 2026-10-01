import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Internships.css';

const Internships = ({ onApplyClick }) => {
  const [internships, setInternships] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    stipend: '',
    deadline: '',
    education_requirement: '',
    required_skills: '',
    minimum_gpa: '',
    experience_requirement: ''
  });

  const [loading, setLoading] = useState(false);

  // ==============================
  // SEARCH & FILTER
  // STUDENT ONLY
  // ==============================

  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // ==============================
  // USER
  // ==============================

  const token = localStorage.getItem('token');

  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const userRole = (
    user.role || ''
  ).toLowerCase();

  const isStudent =
    userRole === 'student';

  const isAuthorizedToPost =
    userRole === 'admin' ||
    userRole === 'employer';

  // ==============================
  // FETCH INTERNSHIPS
  // ==============================

  const fetchInternships = useCallback(async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/internships',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setInternships(
        res.data || []
      );

    } catch (err) {

      console.error(
        'Error loading internships:',
        err.response?.data?.message ||
        err.message
      );

    }
  }, [token]);

  // ==============================
  // LOAD INTERNSHIPS
  // ==============================

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  // ==============================
  // HANDLE FORM CHANGE
  // ==============================

  const handleChange = (e) => {

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

  };

  // ==============================
  // POST INTERNSHIP
  // ==============================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!token) {
      alert('Please login first.');
      return;
    }

    setLoading(true);

    try {

      const res = await axios.post(
        'http://localhost:5000/api/internships',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(
        res.data?.message ||
        'Internship submitted successfully!'
      );

      // ==========================
      // RESET FORM
      // ==========================

      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        stipend: '',
        deadline: '',
        education_requirement: '',
        required_skills: '',
        minimum_gpa: '',
        experience_requirement: ''
      });

      // ==========================
      // REFRESH INTERNSHIPS
      // ==========================

      fetchInternships();

    } catch (err) {

      console.error(
        'Post internship error:',
        err.response?.data ||
        err.message
      );

      alert(
        err.response?.data?.message ||
        'Failed to post internship.'
      );

    } finally {

      setLoading(false);

    }
  };

  // ==============================
  // SEARCH & FILTER
  // STUDENT ONLY
  // ==============================

  const filteredInternships =
    internships.filter((item) => {

      const title =
        (item.title || '').toLowerCase();

      const company =
        (item.company || '').toLowerCase();

      const location =
        (item.location || '').toLowerCase();

      const description =
        (item.description || '').toLowerCase();

      const education =
        (
          item.education_requirement || ''
        ).toLowerCase();

      const skills =
        (
          item.required_skills || ''
        ).toLowerCase();

      const experience =
        (
          item.experience_requirement || ''
        ).toLowerCase();

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      const selectedLocation =
        locationFilter
          .toLowerCase()
          .trim();

      const selectedCompany =
        companyFilter
          .toLowerCase()
          .trim();

      // ==========================
      // SEARCH
      // ==========================

      const matchesSearch =
        !search ||
        title.includes(search) ||
        company.includes(search) ||
        location.includes(search) ||
        description.includes(search) ||
        education.includes(search) ||
        skills.includes(search) ||
        experience.includes(search);

      // ==========================
      // LOCATION FILTER
      // ==========================

      const matchesLocation =
        !selectedLocation ||
        location === selectedLocation;

      // ==========================
      // COMPANY FILTER
      // ==========================

      const matchesCompany =
        !selectedCompany ||
        company === selectedCompany;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCompany
      );
    });

  // ==============================
  // UNIQUE LOCATIONS
  // ==============================

  const locations = [
    ...new Set(
      internships
        .map((item) => item.location)
        .filter(Boolean)
    )
  ].sort();

  // ==============================
  // UNIQUE COMPANIES
  // ==============================

  const companies = [
    ...new Set(
      internships
        .map((item) => item.company)
        .filter(Boolean)
    )
  ].sort();

  // ==============================
  // CLEAR FILTERS
  // ==============================

  const clearFilters = () => {

    setSearchTerm('');
    setLocationFilter('');
    setCompanyFilter('');

  };

  // ==============================
  // CHECK DEADLINE
  // ==============================

  const isExpired = (deadline) => {

    if (!deadline) {
      return false;
    }

    return new Date(deadline) < new Date();

  };

  // ==============================
  // RETURN
  // ==============================

  return (

    <div className="internship-container">

      {/* ==================================================
          POST INTERNSHIP
          EMPLOYER / ADMIN ONLY
      ================================================== */}

      {isAuthorizedToPost && (

        <div className="card post-card">

          <h2>
            Post a New Internship
          </h2>

          <form
            onSubmit={handleSubmit}
            className="internship-form"
          >

            {/* ==========================
                JOB TITLE + COMPANY
            ========================== */}

            <div className="form-group">

              <input
                type="text"
                name="title"
                placeholder="Job Title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
                required
              />

            </div>

            {/* ==========================
                LOCATION + STIPEND
            ========================== */}

            <div className="form-group">

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="stipend"
                placeholder="Stipend"
                value={formData.stipend}
                onChange={handleChange}
              />

            </div>

            {/* ==========================
                DEADLINE
            ========================== */}

            <div className="form-group">

              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />

            </div>

            {/* ==================================================
                STUDENT REQUIREMENTS
            ================================================== */}

            <h3
              style={{
                marginTop: '20px',
                marginBottom: '15px'
              }}
            >
              Student Requirements
            </h3>

            {/* ==========================
                EDUCATION + GPA
            ========================== */}

            <div className="form-group">

              <input
                type="text"
                name="education_requirement"
                placeholder="Education Requirement (e.g. Bachelor's in IT)"
                value={
                  formData.education_requirement
                }
                onChange={handleChange}
              />

              <input
                type="number"
                name="minimum_gpa"
                placeholder="Minimum GPA (e.g. 2.5)"
                value={
                  formData.minimum_gpa
                }
                onChange={handleChange}
                min="0"
                max="4"
                step="0.01"
              />

            </div>

            {/* ==========================
                REQUIRED SKILLS
            ========================== */}

            <input
              type="text"
              name="required_skills"
              placeholder="Required Skills (e.g. React, Node.js, MySQL)"
              value={
                formData.required_skills
              }
              onChange={handleChange}
              style={{
                width: '100%',
                marginBottom: '15px'
              }}
            />

            {/* ==========================
                EXPERIENCE
            ========================== */}

            <input
              type="text"
              name="experience_requirement"
              placeholder="Experience Requirement (e.g. Freshers welcome)"
              value={
                formData.experience_requirement
              }
              onChange={handleChange}
              style={{
                width: '100%',
                marginBottom: '15px'
              }}
            />

            {/* ==========================
                DESCRIPTION
            ========================== */}

            <textarea
              name="description"
              rows="4"
              placeholder="Role Description..."
              value={formData.description}
              onChange={handleChange}
              required
            />

            {/* ==========================
                SUBMIT
            ========================== */}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Posting...'
                : 'Post Internship'}
            </button>

          </form>

        </div>

      )}

      {/* ==================================================
          INTERNSHIP LISTINGS
      ================================================== */}

      <div className="listings-section">

        <h2>
          {isStudent
            ? 'Available Internships'
            : 'My Internship Posts'}
        </h2>

        {/* ==================================================
            SEARCH & FILTER
            STUDENT ONLY
        ================================================== */}

        {isStudent && (

          <div className="filter-card">

            {/* ==========================
                SEARCH
            ========================== */}

            <div className="search-box">

              <span className="search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search internships, companies, locations..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>

            {/* ==========================
                FILTER ROW
            ========================== */}

            <div className="filter-row">

              {/* LOCATION */}

              <select
                value={locationFilter}
                onChange={(e) =>
                  setLocationFilter(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Locations
                </option>

                {locations.map(
                  (location) => (

                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>

                  )
                )}

              </select>

              {/* COMPANY */}

              <select
                value={companyFilter}
                onChange={(e) =>
                  setCompanyFilter(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Companies
                </option>

                {companies.map(
                  (company) => (

                    <option
                      key={company}
                      value={company}
                    >
                      {company}
                    </option>

                  )
                )}

              </select>

              {/* CLEAR */}

              <button
                type="button"
                className="clear-filter-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

            {/* ==========================
                RESULT COUNT
            ========================== */}

            <div className="result-count">

              Showing{' '}

              <strong>
                {filteredInternships.length}
              </strong>

              {' '}of{' '}

              <strong>
                {internships.length}
              </strong>

              {' '}internships

            </div>

          </div>

        )}

        {/* ==================================================
            NO DATA
        ================================================== */}

        {internships.length === 0 ? (

          <p className="no-data">
            No internships available.
          </p>

        ) : (

          <>

            {/* ==================================================
                INTERNSHIP CARDS
            ================================================== */}

            <div className="grid-container">

              {(isStudent
                ? filteredInternships
                : internships
              ).map((item) => {

                const expired =
                  isExpired(
                    item.deadline
                  );

                return (

                  <div
                    key={
                      item.id ||
                      item._id
                    }
                    className="card listing-card"
                  >

                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="card-header">

                      <h3>
                        {item.title}
                      </h3>

                      <span className="badge">
                        {item.company}
                      </span>

                    </div>

                    {/* ==================================================
                        BASIC DETAILS
                    ================================================== */}

                    <div className="card-details">

                      <p>
                        <strong>
                          Location:
                        </strong>{' '}

                        {item.location ||
                          'Not specified'}
                      </p>

                      <p>
                        <strong>
                          Stipend:
                        </strong>{' '}

                        {item.stipend ||
                          'N/A'}
                      </p>

                      <p>
                        <strong>
                          Deadline:
                        </strong>{' '}

                        {item.deadline
                          ? new Date(
                              item.deadline
                            ).toLocaleDateString()
                          : 'No Deadline'}
                      </p>

                    </div>

                    {/* ==================================================
                        DESCRIPTION
                    ================================================== */}

                    <p className="description">

                      {item.description ||
                        'No description available.'}

                    </p>

                    {/* ==================================================
                        STUDENT REQUIREMENTS
                    ================================================== */}

                    {(item.education_requirement ||
                      item.required_skills ||
                      item.minimum_gpa ||
                      item.experience_requirement) && (

                      <div
                        className="requirements-box"
                        style={{
                          marginTop: '15px',
                          padding: '15px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border:
                            '1px solid #e2e8f0'
                        }}
                      >

                        <h4
                          style={{
                            marginTop: 0,
                            marginBottom: '12px'
                          }}
                        >
                          Student Requirements
                        </h4>

                        {/* ==========================
                            EDUCATION
                        ========================== */}

                        {item.education_requirement && (

                          <p>
                            <strong>
                              Education:
                            </strong>{' '}

                            {
                              item.education_requirement
                            }
                          </p>

                        )}

                        {/* ==========================
                            GPA
                        ========================== */}

                        {item.minimum_gpa !== null &&
                          item.minimum_gpa !== undefined &&
                          item.minimum_gpa !== '' && (

                            <p>
                              <strong>
                                Minimum GPA:
                              </strong>{' '}

                              {item.minimum_gpa}
                            </p>

                          )}

                        {/* ==========================
                            SKILLS
                        ========================== */}

                        {item.required_skills && (

                          <p>
                            <strong>
                              Required Skills:
                            </strong>{' '}

                            {item.required_skills}
                          </p>

                        )}

                        {/* ==========================
                            EXPERIENCE
                        ========================== */}

                        {item.experience_requirement && (

                          <p>
                            <strong>
                              Experience:
                            </strong>{' '}

                            {
                              item.experience_requirement
                            }
                          </p>

                        )}

                      </div>

                    )}

                    {/* ==================================================
                        APPLY BUTTON
                        STUDENT ONLY
                        
                        VERIFICATION SECTION REMOVED
                    ================================================== */}
{/* APPLY BUTTON / CLOSED STATUS */}
{isStudent && (
  expired ? (
    <button
      type="button"
      className="btn w-100 apply-btn btn-secondary"
      disabled
    >
      Closed
    </button>
  ) : (
    <button
      type="button"
      className="btn w-100 apply-btn"
      onClick={() => onApplyClick(item)}
    >
      Apply Now
    </button>
  )
)}

                

                  </div>

                );

              })}

            </div>

            {/* ==================================================
                NO SEARCH RESULT
                STUDENT ONLY
            ================================================== */}

            {isStudent &&
              filteredInternships.length === 0 && (

                <div className="no-results">

                  <div className="no-results-icon">
                    🔍
                  </div>

                  <h3>
                    No internships found
                  </h3>

                  <p>
                    Try changing your search
                    or filters.
                  </p>

                  <button
                    type="button"
                    className="clear-filter-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>

                </div>

              )}

          </>

        )}

      </div>

    </div>

  );
};

export default Internships;