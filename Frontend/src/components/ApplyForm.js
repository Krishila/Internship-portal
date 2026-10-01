import React, { useState } from 'react';
import axios from 'axios';
import './ApplyForm.css';

const ApplyForm = ({ internship, onCancel, onSuccess }) => {
  const token = localStorage.getItem('token');

  const [appData, setAppData] = useState({
    full_name: '',
    address: '',
    phone: '',
    education: '',
    gpa: '',
    skills: '',
    experience: '',
    resume_link: ''
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setAppData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =========================
  // HANDLE RESUME UPLOAD
  // =========================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Allow only PDF and images
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, JPG, JPEG, PNG, or WEBP file.');
      e.target.value = '';
      return;
    }

    // Optional file size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Resume file size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setAppData((prev) => ({
        ...prev,
        resume_link: reader.result
      }));

      setPreviewUrl(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // SUBMIT APPLICATION
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check internship
    if (!internship?.id) {
      alert('Internship information is missing.');
      return;
    }

    // Check token
    if (!token) {
      alert('Please login first.');
      return;
    }

    // Check resume
    if (!appData.resume_link) {
      alert('Please upload your Resume/CV.');
      return;
    }

    // Check skills
    if (!appData.skills.trim()) {
      alert('Please enter your skills.');
      return;
    }

    // Check education
    if (!appData.education.trim()) {
      alert('Please enter your education.');
      return;
    }

    // Check GPA
    if (appData.gpa === '') {
      alert('Please enter your GPA.');
      return;
    }

    const gpaValue = Number(appData.gpa);

    if (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4) {
      alert('GPA must be between 0 and 4.');
      return;
    }

    // Check experience
    if (!appData.experience.trim()) {
      alert('Please enter your experience. If you have no experience, write "No experience".');
      return;
    }

    setSubmitting(true);

    try {
      const applicationData = {
        internship_id: internship.id,

        full_name: appData.full_name.trim(),
        address: appData.address.trim(),
        phone: appData.phone.trim(),

        education: appData.education.trim(),
        gpa: gpaValue,
        skills: appData.skills.trim(),
        experience: appData.experience.trim(),

        resume_link: appData.resume_link
      };

      console.log('Submitting application:', {
        ...applicationData,
        resume_link: applicationData.resume_link
          ? '[Resume Uploaded]'
          : ''
      });

      const res = await axios.post(
        'http://localhost:5000/api/applications/apply',
        applicationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(
        res.data.message ||
        'Application submitted successfully!'
      );

      // Clear form after successful application
      setAppData({
        full_name: '',
        address: '',
        phone: '',
        education: '',
        gpa: '',
        skills: '',
        experience: '',
        resume_link: ''
      });

      setPreviewUrl(null);

      // Go back / refresh application list
      if (onSuccess) {
        onSuccess(res.data);
      }

    } catch (err) {
      console.error('Application error:', err);

      if (err.response) {
        console.error('Server response:', err.response.data);
        console.error('Status:', err.response.status);
      }

      alert(
        err.response?.data?.message ||
        'Failed to submit application.'
      );

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apply-card-container">

      <h2>
        Apply for {internship?.title || 'Internship'}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="standard-apply-form"
      >

        {/* =========================
            FULL NAME
        ========================== */}
        <div className="form-group">
          <label>Full Name</label>

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={appData.full_name}
            onChange={handleChange}
            required
          />
        </div>


        {/* =========================
            ADDRESS
        ========================== */}
        <div className="form-group">
          <label>Address</label>

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={appData.address}
            onChange={handleChange}
            required
          />
        </div>


        {/* =========================
            PHONE
        ========================== */}
        <div className="form-group">
          <label>Phone</label>

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={appData.phone}
            onChange={handleChange}
            required
          />
        </div>


        {/* =========================
            EDUCATION
        ========================== */}
        <div className="form-group">
          <label>Education</label>

          <input
            type="text"
            name="education"
            placeholder="e.g. BSc CSIT, BIT, BCA"
            value={appData.education}
            onChange={handleChange}
            required
          />
        </div>


        {/* =========================
            GPA
        ========================== */}
        <div className="form-group">
          <label>GPA</label>

          <input
            type="number"
            name="gpa"
            placeholder="e.g. 3.50"
            min="0"
            max="4"
            step="0.01"
            value={appData.gpa}
            onChange={handleChange}
            required
          />
        </div>


        {/* =========================
            SKILLS
        ========================== */}
        <div className="form-group">
          <label>Skills</label>

          <textarea
            name="skills"
            placeholder="e.g. React, Node.js, MySQL, Java"
            value={appData.skills}
            onChange={handleChange}
            rows="3"
            required
          />

          <small>
            Enter your skills separated by commas.
          </small>
        </div>


        {/* =========================
            EXPERIENCE
        ========================== */}
        <div className="form-group">
          <label>Experience</label>

          <textarea
            name="experience"
            placeholder="Describe your experience or write No experience"
            value={appData.experience}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>


        {/* =========================
            RESUME
        ========================== */}
        <div className="form-group">

          <label>
            Upload Resume/CV
          </label>

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            required
          />

          <small>
            Accepted: PDF, JPG, JPEG, PNG, WEBP — Max 5MB
          </small>

          {previewUrl && (
            <div style={{ marginTop: '10px' }}>

              <small
                style={{
                  color: '#64748b',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Resume Preview:
              </small>

              {previewUrl.startsWith('data:image') ? (

                <img
                  src={previewUrl}
                  alt="Resume Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '180px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1'
                  }}
                />

              ) : (

                <p>
                  Resume uploaded successfully.
                </p>

              )}

            </div>
          )}

        </div>


        {/* =========================
            BUTTONS
        ========================== */}
        <div className="form-actions">

          <button
            type="submit"
            className="btn-primary-submit"
            disabled={submitting}
          >
            {submitting
              ? 'Submitting...'
              : 'Submit Application'}
          </button>


          <button
            type="button"
            className="btn-secondary-cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>

        </div>

      </form>
    </div>
  );
};

export default ApplyForm;