import { useState } from 'react';
import {
  Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight,
  ShieldCheck, Lock, Users, CalendarCheck, HelpCircle, Heart, Phone, KeyRound
} from 'lucide-react';
import api from './api.js';
import './ParentLogin.css';

export default function ParentLogin() {
  const [formData, setFormData] = useState({
    emailAddress: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alertBanner, setAlertBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFieldErrors({});
    setAlertBanner(null);
    setIsLoading(true);

    try {
      const response = await api.login(formData.emailAddress, formData.password);
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
          title: 'Invalid Email or Password',
          message: 'The credentials you entered do not match our records. Please double check and try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive Scenario Switcher
  const applyScenario = (type) => {
    setIsSuccess(false);
    setFieldErrors({});
    setAlertBanner(null);

    switch (type) {
      case 'default':
        setFormData({
          emailAddress: '',
          password: '',
          rememberMe: false
        });
        break;

      case 'required_error':
        setFormData({
          emailAddress: '',
          password: '',
          rememberMe: false
        });
        setFieldErrors({
          emailAddress: 'Please enter your email address',
          password: 'Please enter your password'
        });
        break;

      case 'invalid_credentials':
        setFormData({
          emailAddress: 'mariam.wrong@example.com',
          password: 'wrongpassword',
          rememberMe: false
        });
        setAlertBanner({
          title: 'Invalid Email or Password',
          message: 'The credentials you entered do not match our records. Please double check and try again.'
        });
        setFieldErrors({
          emailAddress: 'Incorrect email or password'
        });
        break;

      case 'success_state':
        setIsSuccess(true);
        setSuccessData({
          title: 'Login Successful!',
          message: 'Welcome back to Tom & Jerry Nursery. Redirecting to your dashboard...',
          dashboard: {
            title: 'Parent Portal Access Ready',
            details: 'You can now review your active enrollment status, daily schedule updates, and communication logs.',
            redirectUrl: '/parent/dashboard'
          }
        });
        break;

      default:
        break;
    }
  };

  return (
    <div className="parent-login-page">
      {/* Top Testing Scenarios Toolbar */}
      <div className="scenario-bar">
        <span>Interactive Login Scenarios:</span>
        <button type="button" onClick={() => applyScenario('default')}>Parent Login (Default)</button>
        <button type="button" onClick={() => applyScenario('required_error')}>Required Fields Error</button>
        <button type="button" onClick={() => applyScenario('invalid_credentials')}>Invalid Email or Password</button>
        <button type="button" onClick={() => applyScenario('success_state')}>Login Successful!</button>
      </div>

      {/* Main Top Navbar */}
      <nav className="login-navbar">
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
          <a href="/register">Parent Registration</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-right">
          <a href="/login" className="active-pill">Parent Login</a>
          <span className="help-link"><HelpCircle size={15} /> Help</span>
          <div className="profile-circle">
            <Users size={16} color="#ffffff" />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="login-main-container">
        {/* Left Column: Welcome Back */}
        <section className="left-hero">
          <div className="tag-badge">
            <Sparkles size={13} color="#2b6b4f" /> WARM &amp; CARING COMMUNITY
          </div>

          <h1 className="hero-title">Welcome Back to Our Family</h1>
          <p className="hero-desc">
            Sign in to access your parent portal, track your child&apos;s application progress,
            and connect with our certified care coordinators.
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

        {/* Right Column: Login Card or Success State */}
        <section className="right-card-wrapper">
          {isSuccess ? (
            /* ─── SUCCESS STATE SCREEN ────────────────────────────────────────── */
            <div className="login-card success-card">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={46} color="#1b5e3f" />
              </div>

              <h2 className="success-title">{successData?.title || 'Login Successful!'}</h2>
              <p className="success-subtitle">
                {successData?.message || 'Welcome back to Tom & Jerry Nursery. Redirecting to your dashboard...'}
              </p>

              <div className="next-steps-box">
                <div className="steps-header">
                  <span className="flag-icon">⚑</span>
                  <h4>{successData?.dashboard?.title || 'Parent Portal Access Ready'}</h4>
                </div>
                <p className="steps-desc">
                  {successData?.dashboard?.details || 'You can now review your active enrollment status, daily schedule updates, and communication logs.'}
                </p>
              </div>

              <a href="/parent/dashboard" className="btn-primary continue-btn">
                Continue to Dashboard <ArrowRight size={18} />
              </a>

              <div className="switch-account-wrapper">
                <button type="button" onClick={() => setIsSuccess(false)} className="link-button">
                  Switch Account
                </button>
                {' • '}
                <a href="/" className="link-button">Back to Home</a>
              </div>
            </div>
          ) : (
            /* ─── LOGIN FORM CARD ─────────────────────────────────────────────── */
            <div className="login-card">
              {/* Alert Banner (Invalid Credentials) */}
              {alertBanner && (
                <div className="alert-banner-box">
                  <div className="alert-icon"><AlertCircle size={20} /></div>
                  <div className="alert-content">
                    <div className="alert-title">{alertBanner.title}</div>
                    <div className="alert-message">{alertBanner.message}</div>
                  </div>
                </div>
              )}

              <div className="card-header">
                <div className="card-header-icon">
                  <KeyRound size={24} color="#1f4434" />
                </div>
                <div>
                  <h2>Welcome Back!</h2>
                  <p>Sign in with your registered email and password to access your family&apos;s portal.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="login-form" noValidate>
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
                      placeholder="Enter your password"
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
                  {fieldErrors.password && (
                    <span className="error-text">{fieldErrors.password}</span>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="form-options-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <span>Remember me</span>
                  </label>

                  <a href="/forgot-password" className="forgot-link">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary submit-btn"
                >
                  {isLoading ? 'Signing in...' : 'Log In →'}
                </button>

                {/* Register Link Box */}
                <div className="join-family-card">
                  <div className="join-text">Don&apos;t have an account yet?</div>
                  <a href="/register" className="btn-join-family">
                    Create Parent Account
                  </a>
                  <small>Looking to enroll your child? Join our family today</small>
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
      <footer className="login-footer">
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
