import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdmissionPortal.css';

const API_BASE = 'http://localhost:5000/api';

export default function AdmissionStatus({ applicationNumber = '#TJ-ADM-2026-8492' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const encoded = encodeURIComponent(applicationNumber);
    axios.get(`${API_BASE}/admissions/status/${encoded}`)
      .then(res => {
        setData(res.data);
        setError(null);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load application status.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [applicationNumber]);

  if (loading) {
    return <div className="admission-portal-container"><div className="loading-state">Loading admission status...</div></div>;
  }

  if (error || !data) {
    return <div className="admission-portal-container"><div className="error-alert-banner">{error || 'Application not found'}</div></div>;
  }

  const { statusBanner, journeyMilestones, applicationDetails, quickActions, whatHappensNext, admissionsOfficeSupport } = data;

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
          <a href="/portal/apply" className="nav-link">Admission Request</a>
          <a href="/portal/applications" className="nav-link active">My Applications</a>
        </nav>
        <div className="nav-profile">
          <div className="avatar-circle">{applicationDetails.parent.initials}</div>
          <div className="profile-info">
            <span className="profile-name">{applicationDetails.parent.name}</span>
            <span className="profile-role">Parent Portal</span>
          </div>
          <button className="logout-btn" title="Log Out">⎋</button>
        </div>
      </header>

      {/* Main Status Container */}
      <main className="status-main-content">
        {/* Breadcrumb & Sync Status */}
        <div className="status-top-bar">
          <div className="breadcrumbs">
            {data.breadcrumbs.map((b, i) => (
              <span key={i}>
                {i > 0 && ' / '}
                <span className={i === data.breadcrumbs.length - 1 ? 'breadcrumb-active' : ''}>{b}</span>
              </span>
            ))}
          </div>
          <div className="sync-badges">
            <span className="badge-sync">🟢 System Active</span>
            <span className="badge-sync">Last Synced: Just now</span>
            <button className="btn-refresh" onClick={() => window.location.reload()}>🔄 Refresh Status</button>
          </div>
        </div>

        {/* Title Header */}
        <div className="status-page-header">
          <span className="academic-year-tag">ADMISSIONS & INTAKE REGISTRY • 2026-2027 Academic Year</span>
          <h1 className="page-title">Admission Application Status</h1>
          <p className="page-subtitle">Track your child's admission request and stay updated on its progress in real time.</p>
        </div>

        {/* Status Callout Banner */}
        <div className="status-hero-card">
          <div className="hero-top-row">
            <div className="hero-tags">
              <span className="status-pill pending">⏳ {statusBanner.status}</span>
              <span className="priority-pill">{statusBanner.priority}</span>
            </div>
            <div className="estimated-time-box">
              <span className="time-label">Estimated Review Window</span>
              <strong className="time-val">{statusBanner.estimatedWindow}</strong>
              <span className="stage-tag">{statusBanner.stageIndicator}</span>
            </div>
          </div>
          <h2 className="hero-title">{statusBanner.title}</h2>
          <p className="hero-desc">{statusBanner.description}</p>
          <div className="hero-advisory">
            <span className="advisory-icon">ℹ️</span>
            <span>{statusBanner.importantAdvisory}</span>
          </div>
        </div>

        {/* Admission Journey Milestones Timeline */}
        <div className="milestones-card">
          <div className="milestones-card-header">
            <h3>Admission Journey Milestones</h3>
            <span className="progression-tag">Site Progression Status: Stage 2</span>
          </div>
          <div className="timeline-horizontal">
            {journeyMilestones.map((milestone, idx) => (
              <div
                key={milestone.step}
                className={`timeline-step ${milestone.isCompleted ? 'completed' : ''} ${milestone.isCurrent ? 'current' : ''}`}
              >
                <div className="step-circle-wrapper">
                  <div className="step-circle">
                    {milestone.isCompleted ? '✓' : milestone.isCurrent ? '👁' : '○'}
                  </div>
                  {idx < journeyMilestones.length - 1 && <div className="step-line"></div>}
                </div>
                <div className="step-details">
                  <div className="step-title-row">
                    <strong>{milestone.title}</strong>
                    {milestone.currentBadge && <span className="current-badge">{milestone.currentBadge}</span>}
                  </div>
                  <span className="stage-subtext">{milestone.stageLabel}</span>
                  <p className="step-note">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Middle Grid: Application Details + Quick Actions */}
        <div className="status-two-col-grid">
          {/* Left: Application Details Card */}
          <div className="details-card">
            <div className="details-card-header">
              <span className="header-icon">📄</span>
              <h3>Application Details</h3>
              <span className="app-id-pill">{applicationDetails.applicationNumber}</span>
            </div>
            <div className="details-card-body">
              <div className="detail-item">
                <div className="avatar-chip blue">{applicationDetails.child.initials}</div>
                <div>
                  <div className="detail-label">Child's Full Name</div>
                  <strong className="detail-val">{applicationDetails.child.name}</strong>
                  <div className="detail-sub">{applicationDetails.child.age}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="avatar-chip green">{applicationDetails.parent.initials}</div>
                <div>
                  <div className="detail-label">Parent / Guardian</div>
                  <strong className="detail-val">{applicationDetails.parent.name}</strong>
                  <div className="detail-sub">{applicationDetails.parent.role}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📅</div>
                <div>
                  <div className="detail-label">Submission Date</div>
                  <strong className="detail-val">{applicationDetails.submissionDate}</strong>
                  <div className="detail-sub">Logged via Parent Portal</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">👥</div>
                <div>
                  <div className="detail-label">Target Group / Class</div>
                  <strong className="detail-val">{applicationDetails.targetGroup}</strong>
                  <div className="detail-sub">{applicationDetails.cohortRoom}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">🎯</div>
                <div>
                  <div className="detail-label">Desired Intake</div>
                  <strong className="detail-val">{applicationDetails.desiredIntake}</strong>
                  <div className="detail-sub">{applicationDetails.sessionSchedule}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">🕒</div>
                <div>
                  <div className="detail-label">Last Registry Sync</div>
                  <strong className="detail-val">{applicationDetails.lastRegistrySync}</strong>
                  <div className="detail-sub">Automated with central database</div>
                </div>
              </div>
            </div>
            <div className="card-footer-notice">
              Names, dates, and reference codes shown above are demonstration placeholders for privacy.
            </div>
          </div>

          {/* Right: Quick Actions & Admissions Office Support */}
          <div className="actions-and-support-col">
            <div className="quick-actions-card">
              <h4>⚡ Quick Actions</h4>
              <button className="btn-action-primary">View Application Details ↗</button>
              <button className="btn-action-outline">‹ Back to Parent Portal</button>
              <button className="btn-action-outline">
                📥 Download Application (PDF) <span className="file-size-tag">248 KB</span>
              </button>
              <div className="action-hint">
                🔒 Secured 256-bit encryption for all uploaded family records.
              </div>
            </div>

            <div className="support-card">
              <div className="support-header">
                <span className="support-icon">🎧</span>
                <div>
                  <h4>Admissions Office Support</h4>
                  <span className="support-role">Family Admissions Liaison</span>
                </div>
              </div>
              <p className="support-text">
                Have questions or need to update contact information? Our team is available to assist your family throughout the admissions journey.
              </p>
              <div className="support-channel">
                <span className="channel-label">Direct Inquiries</span>
                <a href={`mailto:${admissionsOfficeSupport.email}`} className="channel-link">
                  ✉️ {admissionsOfficeSupport.email}
                </a>
              </div>
              <div className="support-channel">
                <span className="channel-label">Phone Support</span>
                <a href={`tel:${admissionsOfficeSupport.phone}`} className="channel-link">
                  📞 {admissionsOfficeSupport.phone}
                </a>
              </div>
              <div className="support-hours">
                <span>Admissions Desk Hours</span>
                <strong>{admissionsOfficeSupport.hours}</strong>
              </div>
              <div className="support-footer-note">
                Response guaranteed within 24 working hours
              </div>
            </div>

            <div className="nursery-badge-card">
              <div className="badge-icon">🌿</div>
              <div>
                <strong>{admissionsOfficeSupport.highlightBadge.title}</strong>
                <p>{admissionsOfficeSupport.highlightBadge.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* What Happens Next? Section */}
        <div className="what-next-card">
          <h3>What Happens Next?</h3>
          <p className="what-next-sub">
            Our nursery team will review your application. Please check this page for updates to your application status.
          </p>
          <div className="next-steps-list">
            {whatHappensNext.map((step) => (
              <div key={step.stepNumber} className="next-step-item">
                <div className="step-badge">{step.stepNumber}</div>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
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
