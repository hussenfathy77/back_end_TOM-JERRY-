import { useState } from 'react';
import {
  Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight,
  ShieldCheck, Lock, Users, CalendarCheck, HelpCircle, Heart, Phone, Mail
} from 'lucide-react';
import api from './api.js';
import './ParentRegistration.css';

export default function ParentRegistration() {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alertBanner, setAlertBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFieldErrors({});
    setAlertBanner(null);
    setIsLoading(true);

    try {
      const response = await api.registerParent(formData);
      setIsSuccess(true);
      setSuccessData(response);
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      if (err.alert) {
        setAlertBanner(err.alert);
      } else if (!err.errors) {
        setAlertBanner({
          title: 'Unable to create your account right now. Please try again.',
          message: 'If the issue persists, please check your network connection or contact our admissions support team.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive Test Scenario Switcher (from Screenshot)
  const applyScenario = (type) => {
    setIsSuccess(false);
    setFieldErrors({});
    setAlertBanner(null);

    switch (type) {
      case 'valid':
        setFormData({
          fullName: 'Mariam Al-Mansoor',
          emailAddress: `mariam.${Date.now().toString().slice(-4)}@example.com`,
          phoneNumber: '+1 (555) 019-8234',
          password: 'SecurePassword123',
          confirmPassword: 'SecurePassword123'
        });
        break;

      case 'required_error':
        setFormData({
          fullName: '',
          emailAddress: '',
          phoneNumber: '',
          password: '',
          confirmPassword: ''
        });
        setFieldErrors({
          fullName: 'Please enter your full name',
          emailAddress: 'Please enter your email address',
          phoneNumber: 'Please enter your phone number',
          password: 'Please enter a password',
          confirmPassword: 'Please confirm your password'
        });
        break;

      case 'invalid_email':
        setFormData({
          fullName: 'Sarah Ahmed',
          emailAddress: 'invalidemailformat',
          phoneNumber: '+1 (555) 019-8234',
          password: 'SecurePassword123',
          confirmPassword: 'SecurePassword123'
        });
        setFieldErrors({
          emailAddress: 'Please enter a valid email address.'
        });
        break;

      case 'password_mismatch':
        setFormData({
          fullName: 'Sarah Ahmed',
          emailAddress: 'sarah.ahmed@example.com',
          phoneNumber: '+1 (555) 019-8234',
          password: 'SecurePassword123',
          confirmPassword: 'DifferentPassword123'
        });
        setFieldErrors({
          confirmPassword: 'Passwords do not match'
        });
        break;

      case 'email_already_registered':
        setFormData({
          fullName: 'Sarah Ahmed',
          emailAddress: 'sarah.ahmed@example.com',
          phoneNumber: '+1 (555) 019-8234',
          password: 'SecurePassword123',
          confirmPassword: 'SecurePassword123'
        });
        setAlertBanner({
          title: 'This email is already registered',
          message: 'An account with this email already exists. Please log in or reset your password.',
          action: { label: 'Log In here', link: '/login' }
        });
        setFieldErrors({
          emailAddress: 'This email address is already registered. Please log in.'
        });
        break;

      case 'registration_failed':
        setAlertBanner({
          title: 'Unable to create your account right now. Please try again.',
          message: 'If the issue persists, please check your network connection or contact our admissions support team.'
        });
        break;

      case 'success_state':
        setIsSuccess(true);
        setSuccessData({
          title: 'Account Created Successfully!',
          message: 'Your parent account has been created successfully. You can now log in to continue.',
          nextSteps: {
            title: 'Next Steps for Families',
            description: "Log in to begin or track your child's nursery application, schedule nursery garden tours, and connect with our care coordinators.",
            note: 'Please note: Creating an account establishes your parent portal profile and does not mean admission has been approved.'
          }
        });
        break;

      default:
        break;
    }
  };

  return (
    <div className="parent-reg-page">
      {/* Interactive Scenario Bar for Developer / Tester */}
      <div className="scenario-bar">
        <span>Interactive Test Scenarios:</span>
        <button type="button" onClick={() => applyScenario('valid')}>Valid Form</button>
        <button type="button" onClick={() => applyScenario('required_error')}>Required Fields Error</button>
        <button type="button" onClick={() => applyScenario('invalid_email')}>Invalid Email</button>
        <button type="button" onClick={() => applyScenario('password_mismatch')}>Password Mismatch</button>
        <button type="button" onClick={() => applyScenario('email_already_registered')}>Email Already Registered</button>
        <button type="button" onClick={() => applyScenario('registration_failed')}>Registration Failed</button>
        <button type="button" onClick={() => applyScenario('success_state')}>Success State</button>
      </div>

      {/* Main Top Navbar */}
      <nav className="reg-navbar">
        <div className="logo-section">
          <div className="logo-sparkle">
            <Sparkles size={20} color="#1f4434" />
          </div>
          <div>
            <div className="brand-title">Tom &amp; Jerry Nursery</div>
            <div className="brand-sub">Early Childhood Care</div>
          </div>
        </div>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="#about">About Us</a>
          <a href="#environment">Our Environment</a>
          <a href="/register" className="active-pill">Parent Registration</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-right">
          <a href="/login" className="login-link">Parent Login</a>
          <span className="help-link"><HelpCircle size={15} /> Help</span>
          <div className="profile-circle">
            <Users size={16} color="#ffffff" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="reg-main-container">
        {/* Left Column: Community & Information */}
        <section className="left-hero">
          <div className="tag-badge">
            <Sparkles size={13} color="#2b6b4f" /> WARM &amp; CARING COMMUNITY
          </div>

          <h1 className="hero-title">Welcome to Our Family</h1>
          <p className="hero-desc">
            Join our nursery community and take the first step toward your child&apos;s admission.
            Create an account to schedule visits, manage admissions, and connect with caring early-learning educators.
          </p>

          {/* Mini Interactive Rooms Card */}
          <div className="mini-rooms-card">
            <div className="mini-card-header">
              <span className="mini-pill">Early Years Foundation</span>
              <span className="safe-haven-tag">Safe Havens</span>
            </div>
            <h3>Joyful discovery in every gentle step</h3>
            <p>Calm daily rhythms, organic sensory activities, and nurturing teachers who honor every child&apos;s wonder.</p>
            <div className="rooms-visual-diagram">
              <span className="room-bubble a">A</span>
              <span className="room-bubble b">B</span>
              <span className="room-bubble c">C</span>
            </div>
          </div>

          {/* 3 Value Propositions */}
          <div className="value-props">
            <div className="prop-item">
              <div className="prop-icon green"><CheckCircle2 size={18} /></div>
              <div>
                <h4>Direct Admission Tracking &amp; Instant Updates</h4>
                <p>Follow intake review milestones, schedule visits, and complete secure parent forms.</p>
              </div>
            </div>

            <div className="prop-item">
              <div className="prop-icon blue"><CalendarCheck size={18} /></div>
              <div>
                <h4>Personalized Nursery Visit Scheduling</h4>
                <p>Pick morning garden play tours and meet educators at times convenient for you.</p>
              </div>
            </div>

            <div className="prop-item">
              <div className="prop-icon orange"><Heart size={18} /></div>
              <div>
                <h4>Direct Pastoral &amp; Admissions Office Dialogue</h4>
                <p>Direct two-way messaging with certified early-childhood care coordinators.</p>
              </div>
            </div>
          </div>

          <blockquote className="quote-box">
            &ldquo;A safe, nurturing haven where every child feels valued, secure, and celebrated every single day.&rdquo;
          </blockquote>
        </section>

        {/* Right Column: Registration Card or Success State */}
        <section className="right-card-wrapper">
          {isSuccess ? (
            /* ─── SUCCESS STATE SCREEN ────────────────────────────────────────── */
            <div className="reg-card success-card">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={46} color="#1b5e3f" />
              </div>

              <h2 className="success-title">{successData?.title || 'Account Created Successfully!'}</h2>
              <p className="success-subtitle">
                {successData?.message || 'Your parent account has been created successfully. You can now log in to continue.'}
              </p>

              {/* Next Steps for Families Box */}
              <div className="next-steps-box">
                <div className="steps-header">
                  <span className="flag-icon">⚑</span>
                  <h4>{successData?.nextSteps?.title || 'Next Steps for Families'}</h4>
                </div>
                <p className="steps-desc">
                  {successData?.nextSteps?.description || "Log in to begin or track your child's nursery application, schedule nursery garden tours, and connect with our care coordinators."}
                </p>
                <div className="steps-note">
                  ⓘ {successData?.nextSteps?.note || 'Please note: Creating an account establishes your parent portal profile and does not mean admission has been approved.'}
                </div>
              </div>

              {/* Action Buttons */}
              <a href="/login" className="btn-primary continue-btn">
                Continue to Login <ArrowRight size={18} />
              </a>

              <a href="/" className="back-home-link">
                Back to Home
              </a>

              <div className="card-support-footer">
                Need assistance? Contact our Admissions Office at{' '}
                <a href="mailto:admissions@tomjerrynursery.com">admissions@tomjerrynursery.com</a> or +1 (555) 019-8230.
              </div>
            </div>
          ) : (
            /* ─── REGISTRATION FORM CARD ─────────────────────────────────────── */
            <div className="reg-card">
              {/* Alert Banner (Email Already Registered or Registration Failed) */}
              {alertBanner && (
                <div className="alert-banner-box">
                  <div className="alert-icon"><AlertCircle size={20} /></div>
                  <div className="alert-content">
                    <div className="alert-title">{alertBanner.title}</div>
                    <div className="alert-message">
                      {alertBanner.message}{' '}
                      {alertBanner.action && (
                        <a href={alertBanner.action.link} className="alert-action-link">
                          {alertBanner.action.label}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="card-header">
                <div className="card-header-icon">
                  <Users size={24} color="#1f4434" />
                </div>
                <div>
                  <h2>Create Your Parent Account</h2>
                  <p>Join our nursery community and take the first step toward your child&apos;s admission.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="reg-form" noValidate>
                {/* Parent Full Name */}
                <div className="form-group">
                  <label htmlFor="fullName">
                    Parent/Guardian Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g., Mariam Al-Mansoor"
                    className={fieldErrors.fullName ? 'input-error' : ''}
                  />
                  {fieldErrors.fullName && (
                    <span className="error-text">{fieldErrors.fullName}</span>
                  )}
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label htmlFor="emailAddress">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    id="emailAddress"
                    name="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    placeholder="e.g., mariam.mansoor@example.com"
                    className={fieldErrors.emailAddress ? 'input-error' : ''}
                  />
                  {fieldErrors.emailAddress && (
                    <span className="error-text">{fieldErrors.emailAddress}</span>
                  )}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label htmlFor="phoneNumber">
                    Phone Number <span className="req">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 019-8234"
                    className={fieldErrors.phoneNumber ? 'input-error' : ''}
                  />
                  {fieldErrors.phoneNumber && (
                    <span className="error-text">{fieldErrors.phoneNumber}</span>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label htmlFor="password">
                    Password <span className="req">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter at least 8 characters"
                      className={fieldErrors.password ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <span className="helper-note">ⓘ Must be at least 8 characters with a letter &amp; number</span>
                  {fieldErrors.password && (
                    <span className="error-text">{fieldErrors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirm Password <span className="req">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className={fieldErrors.confirmPassword ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span className="error-text">{fieldErrors.confirmPassword}</span>
                  )}
                </div>

                {/* Terms agreement */}
                <p className="terms-caption">
                  By creating an account, you agree to Tom &amp; Jerry Nursery&apos;s{' '}
                  <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary submit-btn"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account →'}
                </button>

                {/* Login Redirect */}
                <div className="login-prompt">
                  Already have an account? <a href="/login">Log In</a>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>

      {/* Bottom 4 Trust Badges */}
      <section className="trust-badges-grid">
        <div className="badge-card">
          <ShieldCheck size={20} className="badge-icon" />
          <div>
            <h5>Regulated &amp; Licensed</h5>
            <small>Early years quality standards</small>
          </div>
        </div>

        <div className="badge-card">
          <Lock size={20} className="badge-icon" />
          <div>
            <h5>256-Bit SSL Safeguards</h5>
            <small>Encrypted family records</small>
          </div>
        </div>

        <div className="badge-card">
          <Heart size={20} className="badge-icon" />
          <div>
            <h5>Child-First Nursery</h5>
            <small>Low staff-to-child ratios</small>
          </div>
        </div>

        <div className="badge-card">
          <Phone size={20} className="badge-icon" />
          <div>
            <h5>Admissions Desk</h5>
            <small>Friendly phone &amp; visit support</small>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="reg-footer">
        <div>&copy; 2026 Tom &amp; Jerry Nursery. Warm care &amp; mindful learning.</div>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/safeguarding">Safeguarding Policy</a>
          <a href="/faq">Support &amp; FAQ</a>
        </div>
      </footer>
    </div>
  );
}
