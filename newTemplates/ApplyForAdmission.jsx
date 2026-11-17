import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdmissionPortal.css';

const API_BASE = 'http://localhost:5000/api';

export default function ApplyForAdmission({ userSession, onNavigateToStatus }) {
  const [formData, setFormData] = useState({
    parentName: userSession?.fullName || 'Mariam Mansoor',
    parentEmail: userSession?.email || 'mariam.mansoor@example.com',
    parentPhone: userSession?.phone || '+1 (555) 234-5678',
    relationship: 'Mother',
    childName: '',
    childDob: '',
    gender: 'Female',
    requestedClass: 'Toddlers (13-24 mo)',
    desiredTerm: 'Spring Term (Jan 2027)',
    notes: ''
  });

  const [options, setOptions] = useState({
    relationships: [],
    requestedClasses: [],
    desiredTerms: [],
    officeGuidance: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch dropdown options & guidance
    axios.get(`${API_BASE}/admissions/form-options`)
      .then(res => {
        setOptions(res.data);
      })
      .catch(err => console.error('Failed to load form options:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !formData.childName.trim()) {
      setError('Please provide your child\'s full legal name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/admissions/portal-apply`,
        { ...formData, isDraft },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onNavigateToStatus) {
        onNavigateToStatus(response.data.applicationNumber);
      } else {
        alert(`${isDraft ? 'Draft saved' : 'Application submitted'}! Application #: ${response.data.applicationNumber}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit admission request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admission-portal-container">
      {/* Top Navbar */}
      <header className="admission-navbar">
        <div className="nav-left">
          <div className="logo-badge">🐱🐭</div>
          <div>
            <div className="brand-title">Tom & Jerry Nursery</div>
            <div className="brand-subtitle">Early Childhood Care</div>
          </div>
        </div>
        <nav className="nav-links">
          <a href="/portal/home" className="nav-link">Home</a>
          <a href="/portal/apply" className="nav-link active">Admission Request</a>
          <a href="/portal/applications" className="nav-link">My Applications</a>
        </nav>
        <div className="nav-profile">
          <div className="avatar-circle">MM</div>
          <div className="profile-info">
            <span className="profile-name">{formData.parentName}</span>
            <span className="profile-role">Parent Portal</span>
          </div>
          <button className="logout-btn" title="Log Out">⎋</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="form-main-content">
        <div className="form-page-header">
          <span className="breadcrumb">Home › Admission Request</span>
          <h1 className="page-title">Apply for Admission</h1>
          <p className="page-subtitle">Complete the form below to submit an admission request for your child at Tom & Jerry Nursery.</p>
          <div className="session-verified-tag">
            <span className="dot-green"></span> Verified Parent Session
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="stepper-bar">
          <div className="step-item completed">
            <span className="step-num">✓</span>
            <span className="step-label">STEP 1<br /><strong>Parent & Guardian Info</strong></span>
          </div>
          <div className="step-divider active"></div>
          <div className="step-item active">
            <span className="step-num">2</span>
            <span className="step-label">STEP 2 (CURRENT)<br /><strong>Child Details & Placement</strong></span>
          </div>
        </div>

        {error && <div className="error-alert-banner">{error}</div>}

        {/* Section 1: Parent Information */}
        <section className="form-section-card">
          <div className="section-header">
            <span className="section-step-tag">Step 1</span>
            <h2>Parent / Guardian Information</h2>
            <span className="section-note">Account verified values for communications</span>
          </div>

          <div className="form-grid-two">
            <div className="input-group">
              <label>Full Name *</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  disabled
                  className="read-only-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address *</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  disabled
                  className="read-only-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number *</label>
              <div className="input-with-icon">
                <span className="input-icon">📞</span>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Relationship to Child *</label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
              >
                {options.relationships?.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-hint">
            🔒 No new credentials required. This application will link directly to your active parent portal.
          </div>
        </section>

        {/* Section 2: Child Information */}
        <section className="form-section-card">
          <div className="section-header">
            <span className="section-step-tag">Step 2</span>
            <h2>Child Information</h2>
            <span className="section-note">Legal details as they appear on official records</span>
          </div>

          <div className="input-group full-width">
            <label>Child's Full Legal Name *</label>
            <input
              type="text"
              name="childName"
              placeholder="e.g. Liam Mansoor"
              value={formData.childName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-grid-two">
            <div className="input-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="childDob"
                value={formData.childDob}
                onChange={handleChange}
              />
              <span className="sub-hint">Must be between 0 months and 4 years old</span>
            </div>

            <div className="input-group">
              <label>Gender *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={handleChange}
                  /> Female
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={handleChange}
                  /> Male
                </label>
              </div>
            </div>

            <div className="input-group">
              <label>Requested Class / Age Group *</label>
              <select
                name="requestedClass"
                value={formData.requestedClass}
                onChange={handleChange}
              >
                {options.requestedClasses?.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Desired Start Term *</label>
              <select
                name="desiredTerm"
                value={formData.desiredTerm}
                onChange={handleChange}
              >
                {options.desiredTerms?.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 3: Additional Information */}
        <section className="form-section-card">
          <div className="section-header">
            <h2>Additional Information & Notes (Optional)</h2>
          </div>
          <p className="section-description">
            Share any routines, dietary preferences, or scheduling notes our admissions team should keep in mind during application review.
          </p>
          <textarea
            name="notes"
            rows="4"
            placeholder="Tell us about your child's favorite calming routines, allergies, or any scheduling questions..."
            value={formData.notes}
            onChange={handleChange}
          ></textarea>
        </section>

        {/* Admissions Office Guidance Callout */}
        <div className="guidance-callout-card">
          <div className="callout-icon">ℹ️</div>
          <div className="callout-content">
            <h4>Admissions Office Inquiries & Guidance</h4>
            <p>Need assistance with your application? Our Admissions Office is here to support you at <strong>admissions@tomjerrynursery.com</strong> or <strong>+1 (555) 019-8230</strong> (Mon-Fri, 8:30 AM - 4:00 PM).</p>
            <p className="callout-disclaimer">Notice: Submitting this form records your admission request for review. It does not guarantee immediate placement or imply final enrollment.</p>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="form-actions-bar">
          <button type="button" className="btn-cancel" onClick={() => window.history.back()}>
            Cancel
          </button>
          <div className="actions-right">
            <button
              type="button"
              className="btn-save-draft"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
            >
              💾 Save Draft
            </button>
            <button
              type="button"
              className="btn-submit"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Admission Request →'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="admission-footer">
        <div>© 2026 Tom & Jerry Nursery. Warm care & mindful learning. Licensed Early Childhood Development & Daycare Center.</div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Safeguarding Policy</a>
          <a href="#">Admissions FAQ</a>
        </div>
      </footer>
    </div>
  );
}
