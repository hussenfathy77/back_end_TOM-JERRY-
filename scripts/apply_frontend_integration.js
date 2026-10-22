const fs = require('fs');
const path = require('path');

const targetDir = 'D:/docm/term 7/agile/project/nursery-admin/nursery-admin';
const srcDir = path.join(targetDir, 'src');

// ==========================================
// 1. UPDATE Login.jsx
// ==========================================
const loginJsx = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Heart,
  BookOpen, CalendarCheck, Users, Shield, AlertCircle, Sparkles
} from 'lucide-react';
import api from './api.js';

export function Logo({ small }) {
  return (
    <div className="logo">
      <div className="logo-ic"><Sparkles size={small ? 16 : 22} color="#34445c" /></div>
      <div><b>Tom &amp; Jerry</b><small>NURSERY MANAGEMENT</small></div>
      <span className="chip g">ADMIN</span>
    </div>
  );
}

function Art() {
  return (
    <svg viewBox="0 0 400 190" width="100%">
      <ellipse cx="200" cy="185" rx="210" ry="40" fill="#dff2e5" />
      <circle cx="200" cy="30" r="17" fill="#ffe8a3" />
      <circle cx="194" cy="28" r="1.5" fill="#7a5b00" />
      <circle cx="206" cy="28" r="1.5" fill="#7a5b00" />
      <path d="M194 35q6 5 12 0" stroke="#7a5b00" fill="none" />
      <rect x="55" y="105" width="8" height="40" fill="#cfa77a" />
      <circle cx="59" cy="95" r="26" fill="#c7e8d0" />
      <rect x="150" y="125" width="28" height="28" rx="5" fill="#b8ddf2" />
      <rect x="180" y="125" width="28" height="28" rx="5" fill="#ffe8a3" />
      <rect x="210" y="125" width="28" height="28" rx="5" fill="#f6d5df" />
      <rect x="165" y="96" width="28" height="28" rx="5" fill="#c7e8d0" />
      <rect x="195" y="96" width="28" height="28" rx="5" fill="#fbdcc0" />
      <g fontSize="15" fontWeight="800" fill="#34445c" textAnchor="middle">
        <text x="164" y="145">A</text>
        <text x="194" y="145">B</text>
        <text x="224" y="145">C</text>
        <text x="179" y="116">1</text>
        <text x="209" y="116" fill="#d97a38">?</text>
      </g>
      <rect x="290" y="150" width="50" height="6" rx="3" fill="#c9a37a" />
      <ellipse cx="315" cy="144" rx="24" ry="6" fill="#b8ddf2" />
      <ellipse cx="315" cy="134" rx="19" ry="6" fill="#c7e8d0" />
      <ellipse cx="315" cy="125" rx="14" ry="5" fill="#ffe8a3" />
      <circle cx="315" cy="114" r="7" fill="#f6d5df" />
      <rect x="350" y="130" width="40" height="22" rx="7" fill="#b8ddf2" />
      <circle cx="361" cy="154" r="6" fill="#34445c" />
      <circle cx="381" cy="154" r="6" fill="#34445c" />
    </svg>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [email, setE] = useState('admin@school.com');
  const [pass, setP] = useState('admin123');
  const [show, setS] = useState(false);
  const [keep, setK] = useState(false);
  const [err, setErr] = useState({});
  const [bad, setBad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const x = {};
    if (!email.trim()) x.email = 'Email is required';
    if (!pass) x.pass = 'Password is required';
    setErr(x);
    if (Object.keys(x).length) {
      setBad(false);
      return;
    }

    setLoading(true);
    setBad(false);
    try {
      const data = await api.login(email.trim(), pass);
      if (data.user?.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      nav('/dashboard');
    } catch (error) {
      setBad(true);
      setErrorMsg(error.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="topbar">
        <span className="chip g"><i className="dot" />ADMIN ACCESS PORTAL</span>
        <span className="mut">Connected to Live Backend API</span>
      </div>
      <main>
        <section className="left">
          <Logo />
          <span className="chip y big"><Sparkles size={12} /> NURSERY ADMINISTRATION PORTAL</span>
          <h1>Little Steps, <em>Big Dreams!</em></h1>
          <p className="lead">A happy place to learn, grow, and shine. Empowering educators and directors with serene administrative workflows.</p>
          <div className="card art">
            <div className="tags">
              <span className="chip b"><ShieldCheck size={12} /> FERPA &amp; Early Years Certified</span>
              <span className="chip r"><Heart size={12} /> Child Well-being First</span>
              <span className="chip g"><Lock size={12} /> 256-bit Safeguarded</span>
            </div>
            <Art />
          </div>
          <div className="feats">
            {[[CalendarCheck, 'Attendance', 'Live Sync', '#dbeafe', '#2563eb'],
              [Users, 'Classrooms', 'Staff & Pupils', '#dcfce7', '#16a34a'],
              [Shield, 'Security', 'Admin Only', '#fee2e2', '#e11d48']
            ].map(([I, a, b, bg, c]) => (
              <div className="card feat" key={a}>
                <span className="ic" style={{ background: bg }}><I size={16} color={c} /></span>
                <div><small>{a}</small><b>{b}</b></div>
              </div>
            ))}
          </div>
        </section>

        <form className="card form" onSubmit={submit} noValidate>
          <div className="fh">
            <span className="logo-ic"><BookOpen size={22} color="#34445c" /></span>
            <span className="chip b">ADMIN CONSOLE</span>
          </div>
          <h2>Welcome Back!</h2>
          <p className="mut c">Sign in to manage your nursery.</p>

          {bad && (
            <div className="alert">
              <AlertCircle size={14} />
              <div>
                <b>Authentication Failed</b>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          <label>ADMIN EMAIL ADDRESS <i>*</i></label>
          <div className={'inp' + (err.email ? ' er' : '')}>
            <Mail size={14} />
            <input
              type="email"
              value={email}
              onChange={e => setE(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          {err.email && err.email.trim() && <div className="em"><AlertCircle size={12} />{err.email}</div>}

          <label>PASSWORD <i>*</i></label>
          <div className={'inp' + (err.pass ? ' er' : '')}>
            <Lock size={14} />
            <input
              type={show ? 'text' : 'password'}
              value={pass}
              onChange={e => setP(e.target.value)}
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setS(!show)}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {err.pass && <div className="em"><AlertCircle size={12} />{err.pass}</div>}

          <div className="row">
            <label className="chk">
              <input type="checkbox" checked={keep} onChange={e => setK(e.target.checked)} />
              Keep admin session active
            </label>
            <span className="chip y">24h Expire</span>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={14} /></>}
          </button>
          <hr />
          <p className="sec"><ShieldCheck size={12} /> Secure access for authorized administrators only.</p>
          <div className="badges">
            <span>🔒 Encrypted</span>
            <span>📝 Audit-Logged</span>
            <span>🌐 API Connected</span>
          </div>
          <p
            className="demo"
            style={{ cursor: 'pointer', textAlign: 'center' }}
            onClick={() => { setE('admin@school.com'); setP('admin123'); }}
            title="Click to fill credentials"
          >
            Demo Admin: <u>admin@school.com</u> / <u>admin123</u>
          </p>
        </form>
      </main>
      <footer>
        <span>© 2026 Tom &amp; Jerry Nursery Management System — <b className="ok">Backend Service Online</b></span>
        <span className="links">
          <a>Privacy &amp; Child Safeguarding</a>
          <a>Staff Policy Handbook</a>
          <a>Support Helpline</a>
        </span>
      </footer>
    </div>
  );
}
`;

fs.writeFileSync(path.join(srcDir, 'Login.jsx'), loginJsx, 'utf8');
console.log('✓ src/Login.jsx updated');

// ==========================================
// 2. UPDATE UserManagement.jsx
// ==========================================
const userManagementJsx = `import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Baby, Bell, Calendar, CalendarCheck, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, CreditCard, Ellipsis, Eye, EyeOff, LayoutGrid, LogOut, Plus, Search,
  School, SlidersHorizontal, UserPlus, Users, X, CircleHelp, RefreshCw
} from 'lucide-react';
import { Logo } from './Login.jsx';
import api from './api.js';
import './UserManagement.css';

const plannedModules = [
  [School, 'Classes & Staff'], [ClipboardList, 'Admission Requests'], [CalendarCheck, 'Attendance'],
  [Activity, 'Daily Activities'], [CreditCard, 'Fees & Payments'], [Bell, 'Announcements']
];

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Teacher',
    password: '',
    status: 'Active'
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers(roleFilter);
      const formatted = (data || []).map(u => {
        const initials = (u.name || '').split(/\\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'U';
        const role = u.role ? u.role.charAt(0) + u.role.slice(1).toLowerCase() : 'Parent';
        const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent';
        return {
          id: u.id,
          name: u.name,
          detail: role === 'Teacher' ? 'Lead Nursery Educator' : 'Parent account',
          email: u.email,
          role,
          status: u.isActive ? 'Active' : 'Inactive',
          date: dateStr,
          initials
        };
      });
      setUsers(formatted);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const filteredUsers = useMemo(() => users.filter(user => {
    const query = search.toLowerCase();
    const matchesSearch = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All Statuses' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [users, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const activeUsers = users.filter(user => user.status === 'Active').length;

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('All Roles');
    setStatusFilter('All Statuses');
    setPage(1);
  };

  const addUser = async (event) => {
    event.preventDefault();
    const name = newUser.name.trim();
    const email = newUser.email.trim();
    if (!name || !email || !newUser.password) return;

    if (newUser.password.length < 6) {
      setPasswordError(true);
      return;
    }

    try {
      setSubmitting(true);
      await api.createUser({
        name,
        email,
        password: newUser.password,
        role: newUser.role
      });
      setModalOpen(false);
      setNewUser({ name: '', email: '', role: 'Teacher', password: '', status: 'Active' });
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.toggleUserStatus(user.id);
      setActiveMenu(null);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  return (
    <div className="um-layout">
      <aside className="um-sidebar">
        <div className="um-brand"><Logo small /></div>
        <div className="um-section-label">CORE MODULES</div>
        <Link className="um-nav-item" to="/dashboard"><LayoutGrid size={15} />Dashboard</Link>
        <Link className="um-nav-item active" to="/user-management"><Users size={15} />User Management<span className="um-dot" /></Link>
        <Link className="um-nav-item" to="/children-management"><Baby size={15} />Children Management</Link>
        <div className="um-section-label">PLANNED MODULES</div>
        {plannedModules.map(([Icon, label]) => (
          <a className="um-nav-item muted" key={label}><Icon size={15} />{label}<span className="um-pill">Soon</span></a>
        ))}
        <div className="um-account">
          <span className="um-avatar admin">AD</span>
          <div><b>Admin</b><small>Administrator</small></div>
          <LogOut size={14} onClick={handleLogout} style={{ cursor: 'pointer', marginLeft: 'auto' }} title="Logout" />
        </div>
      </aside>

      <div className="um-content">
        <header className="um-header">
          <div className="um-breadcrumb">
            <Link to="/dashboard">Home</Link><span>/</span><span className="um-crumb-current">User Management</span>
          </div>
          <div className="um-header-actions">
            <button className="um-notification" onClick={loadUsers} title="Refresh users" aria-label="Refresh">
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
            <span className="um-date"><Calendar size={12} />Academic Year 2026/2027</span>
            <button className="um-profile"><span className="um-avatar yellow">TJ</span><span><b>Admin</b><small>Connected</small></span><ChevronDown size={12} /></button>
          </div>
        </header>

        <main className="um-body">
          <div className="um-title-row">
            <div>
              <h1>User Management</h1>
              <p>Create and manage teacher and parent accounts synced with the database.</p>
            </div>
            <button className="um-add-button" onClick={() => setModalOpen(true)}>
              <UserPlus size={14} />Add New User
            </button>
          </div>

          <section className="um-stats">
            <article className="um-stat">
              <div><small>TOTAL USERS</small><strong>{users.length}</strong><p>Teachers &amp; Parent accounts</p></div>
              <span className="um-stat-icon blue"><Users size={19} /></span>
            </article>
            <article className="um-stat">
              <div>
                <small>ACTIVE USERS</small>
                <strong>{activeUsers}<em>({(activeUsers / Math.max(users.length, 1) * 100).toFixed(1)}%)</em></strong>
                <p>Active status credentials</p>
              </div>
              <span className="um-stat-icon amber"><UserPlus size={19} /></span>
            </article>
            <article className="um-stat">
              <div>
                <small>INACTIVE USERS</small>
                <strong>{users.length - activeUsers}<em>Pending</em></strong>
                <p>Draft / pending onboarding</p>
              </div>
              <span className="um-stat-icon pink"><UserPlus size={19} /></span>
            </article>
          </section>

          <section className="um-filters" aria-label="Filter users">
            <label className="um-search">
              <Search size={14} />
              <input
                placeholder="Search by name or email..."
                value={search}
                onChange={event => { setSearch(event.target.value); setPage(1); }}
              />
            </label>
            <label className="um-select-wrap">
              <SlidersHorizontal className="um-filter-icon" size={12} />
              <select aria-label="Filter by role" value={roleFilter} onChange={event => { setRoleFilter(event.target.value); setPage(1); }}>
                <option>All Roles</option>
                <option>Teacher</option>
                <option>Parent</option>
              </select>
              <ChevronDown size={12} />
            </label>
            <label className="um-select-wrap">
              <select aria-label="Filter by status" value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }}>
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <ChevronDown size={12} />
            </label>
            <button className="um-clear" onClick={clearFilters}><X size={12} />Clear Filters</button>
          </section>

          <section className="um-table-card">
            <div className="um-table-scroll">
              <table className="um-table">
                <thead>
                  <tr>
                    <th className="um-user-heading">USER</th>
                    <th>EMAIL ADDRESS</th>
                    <th>ROLE</th>
                    <th>ACCOUNT<br />STATUS</th>
                    <th>DATE<br />CREATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="um-user-cell">
                          <span className={`um-avatar \${user.role === 'Teacher' ? 'blue' : 'pink'}`}>{user.initials}</span>
                          <span><b>{user.name}</b><small>{user.detail}</small></span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td><span className={`um-role \${user.role.toLowerCase()}`}>{user.role}</span></td>
                      <td><span className={`um-status \${user.status.toLowerCase()}`}><i />{user.status}</span></td>
                      <td>{user.date}</td>
                      <td className="um-action-cell">
                        <button className="um-more" aria-label={`Actions for \${user.name}`} onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}>
                          <Ellipsis size={16} />
                        </button>
                        {activeMenu === user.id && (
                          <div className="um-row-menu">
                            <button onClick={() => toggleStatus(user)}>
                              {user.status === 'Active' ? 'Deactivate user' : 'Activate user'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && !visibleUsers.length && (
                    <tr><td className="um-no-results" colSpan="6">No users found. Click "Add New User" to create one.</td></tr>
                  )}
                  {loading && (
                    <tr><td className="um-no-results" colSpan="6">Loading users from backend...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="um-table-footer">
              <span>Showing <b>{filteredUsers.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredUsers.length)}</b> of <b>{filteredUsers.length}</b> users</span>
              <div className="um-pagination">
                <label>Rows per page:
                  <select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>
                    <option value={6}>6 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={24}>24 / page</option>
                  </select>
                </label>
                <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(current => current - 1)}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => (
                  <button className={page === number ? 'current' : ''} key={number} onClick={() => setPage(number)}>
                    {number}
                  </button>
                ))}
                <button aria-label="Next page" disabled={page === pageCount} onClick={() => setPage(current => current + 1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {modalOpen && (
        <div className="um-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <form className="um-modal" onSubmit={addUser}>
            <div className="um-modal-heading">
              <div className="um-user-modal-title">
                <span><UserPlus size={16} /></span>
                <div><h2>Add New User</h2><p>Create a new teacher or parent account in PostgreSQL.</p></div>
              </div>
              <button type="button" aria-label="Close" onClick={() => setModalOpen(false)}><X size={16} /></button>
            </div>
            <label>Full Name <i>*</i>
              <input required value={newUser.name} onChange={event => setNewUser({ ...newUser, name: event.target.value })} placeholder="e.g. Sarah Ahmed" />
            </label>
            <label>Email Address <i>*</i>
              <input required type="email" value={newUser.email} onChange={event => setNewUser({ ...newUser, email: event.target.value })} placeholder="e.g. sarah@example.com" />
            </label>
            <label>Role <i>*</i>
              <select value={newUser.role} onChange={event => setNewUser({ ...newUser, role: event.target.value })}>
                <option value="Teacher">Teacher (Nursery Staff)</option>
                <option value="Parent">Parent / Guardian</option>
              </select>
            </label>
            <label>Password <i>*</i>
              <span className="um-password-input">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={event => { setNewUser({ ...newUser, password: event.target.value }); setPasswordError(false); }}
                  placeholder="At least 6 characters"
                />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </span>
            </label>
            <p className={\`um-password-hint\${passwordError ? ' error' : ''}\`}>
              <CircleHelp size={11} />Must be at least 6 characters.
            </p>
            <fieldset className="um-status-field">
              <legend>Account Status</legend>
              <label className={newUser.status === 'Active' ? 'checked' : ''}>
                <input type="radio" name="account-status" value="Active" checked={newUser.status === 'Active'} onChange={() => setNewUser({ ...newUser, status: 'Active' })} />
                <span><b>Active</b><small>Immediate portal access</small></span>
              </label>
              <label className={newUser.status === 'Inactive' ? 'checked' : ''}>
                <input type="radio" name="account-status" value="Inactive" checked={newUser.status === 'Inactive'} onChange={() => setNewUser({ ...newUser, status: 'Inactive' })} />
                <span><b>Inactive</b><small>Draft / pending approval</small></span>
              </label>
            </fieldset>
            <div className="um-modal-actions">
              <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : <><span>✓</span> Create User</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(srcDir, 'UserManagement.jsx'), userManagementJsx, 'utf8');
console.log('✓ src/UserManagement.jsx updated');

// ==========================================
// 3. UPDATE ChildrenManagement.jsx
// ==========================================
const childrenManagementJsx = `import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Baby, Bell, Calendar, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, CreditCard, Ellipsis, LayoutGrid, LogOut, Plus, Search, School,
  CalendarCheck, Activity, UserPlus, Users, X, AlertTriangle, Clock3, RefreshCw
} from 'lucide-react';
import { Logo } from './Login.jsx';
import api from './api.js';
import './ChildrenManagement.css';

const navigation = [
  [School, 'Classes & Staff'], [ClipboardList, 'Admission Requests'], [CalendarCheck, 'Attendance'],
  [Activity, 'Daily Activities'], [CreditCard, 'Fees & Payments'], [Bell, 'Announcements']
];

const childFormDefaults = {
  name: '',
  birth: '2022-03-14',
  gender: 'Boy',
  parentId: '',
  phone: '',
  notes: ''
};

export default function ChildrenManagement() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [newChild, setNewChild] = useState(childFormDefaults);

  const loadChildrenData = async () => {
    try {
      setLoading(true);
      const [childrenData, parentsData] = await Promise.all([
        api.getChildren(),
        api.getUsers('PARENT')
      ]);

      const formattedParents = (parentsData || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: '+1 (555) 234-8901'
      }));
      setParents(formattedParents);
      if (formattedParents.length && !newChild.parentId) {
        setNewChild(curr => ({ ...curr, parentId: formattedParents[0].id }));
      }

      const formatted = (childrenData || []).map(c => {
        const fullName = \`\${c.firstName || ''} \${c.lastName || ''}\`.trim();
        const initials = fullName.split(/\\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'CH';
        const birthDate = c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Unknown';
        const dateAdded = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent';
        const genderNormalized = c.gender?.toUpperCase() === 'GIRL' ? 'Girl' : 'Boy';
        return {
          id: c.id,
          name: fullName,
          room: 'Toddler Room A',
          birth: birthDate,
          gender: genderNormalized,
          guardian: c.parent ? c.parent.name : 'Unassigned',
          email: c.parent ? c.parent.email : 'N/A',
          phone: '+1 (555) 234-8901',
          date: dateAdded,
          initials,
          tone: genderNormalized === 'Girl' ? 'pink' : 'blue'
        };
      });
      setChildren(formatted);
    } catch (err) {
      console.error('Failed to load children:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildrenData();
  }, []);

  const filteredChildren = useMemo(() => children.filter(child => {
    const query = search.toLowerCase();
    const matchesSearch = \`\${child.name} \${child.guardian} \${child.email}\`.toLowerCase().includes(query);
    return matchesSearch && (gender === 'All' || child.gender === gender);
  }), [children, search, gender]);

  const visibleChildren = filteredChildren.slice((page - 1) * 6, page * 6);
  const totalPages = Math.max(1, Math.ceil(filteredChildren.length / 6));

  const clearFilters = () => {
    setSearch('');
    setGender('All');
    setPage(1);
  };

  const createChild = async (event) => {
    event.preventDefault();
    const name = newChild.name.trim();
    if (!name || !newChild.birth || !newChild.parentId) {
      alert('Please fill in child name, birth date, and select a parent account.');
      return;
    }

    const parts = name.split(/\\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || firstName;

    try {
      setSubmitting(true);
      await api.createChild({
        firstName,
        lastName,
        dateOfBirth: new Date(newChild.birth).toISOString(),
        gender: newChild.gender.toUpperCase(),
        parentId: newChild.parentId
      });
      setModalOpen(false);
      setNewChild(childFormDefaults);
      await loadChildrenData();
    } catch (err) {
      alert(err.message || 'Failed to create child');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  return (
    <div className="um-layout">
      <aside className="um-sidebar">
        <div className="um-brand"><Logo small /></div>
        <div className="um-section-label">CORE MODULES</div>
        <Link className="um-nav-item" to="/dashboard"><LayoutGrid size={15} />Dashboard</Link>
        <Link className="um-nav-item" to="/user-management"><Users size={15} />User Management</Link>
        <Link className="um-nav-item active" to="/children-management"><Baby size={15} />Children Management<span className="um-dot" /></Link>
        <div className="um-section-label">PLANNED MODULES</div>
        {navigation.map(([Icon, label]) => (
          <a className="um-nav-item muted" key={label}><Icon size={15} />{label}<span className="um-pill">Soon</span></a>
        ))}
        <div className="um-account">
          <span className="um-avatar admin">AD</span>
          <div><b>Admin</b><small>Administrator</small></div>
          <LogOut size={14} onClick={handleLogout} style={{ cursor: 'pointer', marginLeft: 'auto' }} title="Logout" />
        </div>
      </aside>

      <div className="um-content">
        <header className="um-header">
          <div className="um-breadcrumb">
            <Link to="/dashboard">Home</Link><span>/</span><span className="um-crumb-current">Children Management</span>
          </div>
          <div className="um-header-actions">
            <button className="um-notification" onClick={loadChildrenData} title="Refresh children" aria-label="Refresh">
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
            <span className="um-date"><Calendar size={12} />Academic Year 2026/2027</span>
            <button className="um-profile"><span className="um-avatar yellow">TJ</span><span><b>Admin</b><small>Connected</small></span><ChevronDown size={12} /></button>
          </div>
        </header>

        <main className="um-body cm-body">
          <div className="um-title-row">
            <div>
              <h1>Children Management</h1>
              <p>Manage children's profiles and records synced with the database.</p>
            </div>
            <button className="um-add-button" onClick={() => setModalOpen(true)}>
              <Plus size={14} />Add New Child
            </button>
          </div>

          <section className="um-stats cm-stats">
            <article className="um-stat">
              <div><small>TOTAL CHILDREN</small><strong>{children.length}</strong><p>Active nursery cohort</p></div>
              <span className="um-stat-icon green"><Baby size={19} /></span>
            </article>
            <article className="um-stat">
              <div><small>RECENTLY ENROLLED</small><strong>{children.length}</strong><p>Enrolled pupils</p></div>
              <span className="um-stat-icon amber"><Clock3 size={19} /></span>
            </article>
            <article className="um-stat">
              <div><small>REGISTERED PARENTS</small><strong>{parents.length}</strong><p>Eligible guardians</p></div>
              <span className="um-stat-icon pink"><AlertTriangle size={18} /></span>
            </article>
          </section>

          <section className="um-filters cm-filters" aria-label="Filter children">
            <label className="um-search">
              <Search size={14} />
              <input
                placeholder="Search by child name or parent..."
                value={search}
                onChange={event => { setSearch(event.target.value); setPage(1); }}
              />
            </label>
            <label className="um-select-wrap">
              <span>Gender:</span>
              <select aria-label="Filter by gender" value={gender} onChange={event => { setGender(event.target.value); setPage(1); }}>
                <option value="All">All</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
              <ChevronDown size={12} />
            </label>
            <button className="um-clear" onClick={clearFilters}><X size={12} />Clear Filters</button>
          </section>

          <section className="um-table-card cm-table-card">
            <div className="um-table-scroll">
              <table className="um-table cm-table">
                <thead>
                  <tr>
                    <th>CHILD</th>
                    <th>DATE OF BIRTH</th>
                    <th>GENDER</th>
                    <th>PARENT / GUARDIAN</th>
                    <th>CONTACT</th>
                    <th>DATE ADDED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleChildren.map((child, index) => (
                    <tr key={child.id || index}>
                      <td>
                        <div className="um-user-cell">
                          <span className={`um-avatar \${child.tone}`}>{child.initials}</span>
                          <span><b>{child.name}</b><small>{child.room}</small></span>
                        </div>
                      </td>
                      <td>{child.birth}</td>
                      <td><span className={`cm-gender \${child.gender.toLowerCase()}`}>{child.gender}</span></td>
                      <td><span className="cm-guardian"><b>{child.guardian}</b><small>{child.email}</small></span></td>
                      <td className="cm-phone">{child.phone}</td>
                      <td>{child.date}</td>
                      <td className="um-action-cell">
                        <button className="um-more" aria-label={`Actions for \${child.name}`} onClick={() => setActiveMenu(activeMenu === index ? null : index)}>
                          <Ellipsis size={16} />
                        </button>
                        {activeMenu === index && (
                          <div className="um-row-menu">
                            <button onClick={() => setActiveMenu(null)}>View child profile</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && !visibleChildren.length && (
                    <tr><td className="um-no-results" colSpan="7">No children found. Click "Add New Child" to enroll one.</td></tr>
                  )}
                  {loading && (
                    <tr><td className="um-no-results" colSpan="7">Loading children from database...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="um-table-footer">
              <span>Showing <b>{filteredChildren.length ? (page - 1) * 6 + 1 : 0}-{Math.min(page * 6, filteredChildren.length)}</b> of <b>{filteredChildren.length}</b> children</span>
              <div className="um-pagination">
                <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(current => current - 1)}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button className={page === number ? 'current' : ''} key={number} onClick={() => setPage(number)}>
                    {number}
                  </button>
                ))}
                <button aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(current => Math.min(current + 1, totalPages))}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {modalOpen && (
        <div className="um-modal-backdrop cm-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <form className="um-modal cm-modal" onSubmit={createChild}>
            <div className="um-modal-heading">
              <div className="cm-modal-title">
                <span><UserPlus size={17} /></span>
                <div><h2>Add New Child</h2><p>Create a child profile in the nursery system.</p></div>
              </div>
              <button type="button" aria-label="Close" onClick={() => setModalOpen(false)}><X size={17} /></button>
            </div>
            <label>Full Name <i>*</i>
              <input required value={newChild.name} onChange={event => setNewChild({ ...newChild, name: event.target.value })} placeholder="Enter child's full name (e.g. Leo Vance)" />
            </label>
            <div className="cm-form-row">
              <label>Date of Birth <i>*</i>
                <span className="cm-input-icon">
                  <input required type="date" value={newChild.birth} onChange={event => setNewChild({ ...newChild, birth: event.target.value })} />
                  <CalendarDays size={14} />
                </span>
              </label>
              <label>Gender <i>*</i>
                <select value={newChild.gender} onChange={event => setNewChild({ ...newChild, gender: event.target.value })}>
                  <option value="Boy">Boy (Male)</option>
                  <option value="Girl">Girl (Female)</option>
                </select>
              </label>
            </div>
            <label>Parent / Guardian Account <i>*</i>
              {parents.length > 0 ? (
                <select
                  value={newChild.parentId}
                  onChange={event => setNewChild({ ...newChild, parentId: event.target.value })}
                  required
                >
                  <option value="">-- Select Parent Account --</option>
                  {parents.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.email})
                    </option>
                  ))}
                </select>
              ) : (
                <p style={{ color: '#d97706', fontSize: '12px' }}>
                  No Parent accounts found in database. Please create a Parent in "User Management" first!
                </p>
              )}
            </label>
            <label>Parent / Guardian Contact Number
              <input value={newChild.phone} onChange={event => setNewChild({ ...newChild, phone: event.target.value })} placeholder="+1 (555) 234-8901" />
            </label>
            <label>Additional Notes &amp; Allergies <small>(optional)</small>
              <textarea value={newChild.notes} onChange={event => setNewChild({ ...newChild, notes: event.target.value })} placeholder="Add any important notes or allergies" />
            </label>
            <div className="um-modal-actions">
              <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={submitting || !parents.length}>
                {submitting ? 'Creating...' : <><span>✓</span> Create Child</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(srcDir, 'ChildrenManagement.jsx'), childrenManagementJsx, 'utf8');
console.log('✓ src/ChildrenManagement.jsx updated');

// ==========================================
// 4. UPDATE Dashboard.jsx
// ==========================================
const dashboardJsx = `import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Users, Baby, School, Inbox, CalendarCheck, Palette, CreditCard,
  Bell, Calendar, UserPlus, Smile, UserCheck, ClipboardList, Heart, Grid2x2,
  Lock, Activity, Building2, ChevronDown, LogOut, ArrowRight, ChevronRight,
  FileText, PenLine, Zap, BarChart3, Cloud, Info, PlayCircle, RefreshCw
} from 'lucide-react';
import { Logo } from './Login.jsx';
import api from './api.js';

export default function Dashboard({ empty }) {
  const nav = useNavigate();
  const [totalChildren, setTotalChildren] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      nav('/login');
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [children, users] = await Promise.all([
          api.getChildren().catch(() => []),
          api.getUsers().catch(() => [])
        ]);
        setTotalChildren(children?.length || 0);
        setTotalUsers(users?.length || 0);
        setActiveUsers(users?.filter(u => u.isActive !== false)?.length || 0);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [nav]);

  const handleLogout = () => {
    api.logout();
    nav('/login');
  };

  const pend = empty ? 0 : 5;
  const planned = [
    [School, 'Classes & Staff'],
    [Inbox, 'Admission Requests', 1],
    [CalendarCheck, 'Attendance'],
    [Palette, 'Daily Activities'],
    [CreditCard, 'Fees & Payments'],
    [Bell, 'Announcements']
  ];

  const stats = [
    ['Total Children', totalChildren, Smile, '#dbeafe', '#2563eb', 'Enrolled across all rooms', '#2563eb'],
    ['Total Users', totalUsers, Users, '#dcfce7', '#16a34a', 'Teachers & Parent accounts', '#16a34a'],
    ['Active Users', activeUsers, UserCheck, '#fef3c7', '#d97706', 'Active status credentials', '#d97706'],
    ['Pending Admissions', pend, ClipboardList, '#fce7f3', '#e11d48', pend ? 'Requires administrative review' : 'No pending reviews', '#e11d48']
  ];

  const acts = [
    [UserPlus, '#dcfce7', '#16a34a', 'Teacher account created: Primary Lead Educator', 'By Admin — System verified', 'Just now'],
    [Baby, '#ffedd5', '#ea580c', 'New child record enrolled into nursery', 'By Admin — Health profile documented', '2 hours ago']
  ];

  const Q = [
    [Users, 'Manage Users', 'Create, view, edit, and manage teacher and parent accounts.', 'Sprint 1 Ready', 'Open Users', '#dbeafe', '#2563eb', '/user-management'],
    [Heart, 'Manage Children', "View and maintain children's enrollment and classroom records.", 'Sprint 3 Ready', 'Open Children', '#dcfce7', '#16a34a', '/children-management'],
    [Inbox, 'Review Admissions', 'Review incoming admission requests and guardian submissions.', 'Planned Module', 'Review', '#fce7f3', '#e11d48', null],
    [Grid2x2, 'Manage Classes', 'Organize room capacities and assign designated teachers.', 'Planned Module', 'Setup', '#ffedd5', '#ea580c', null]
  ];

  return (
    <div className="dash">
      <aside>
        <div className="sb-top"><Logo small /></div>
        <div className="sec-t">CORE MODULES</div>
        <Link className="nav on" to="/dashboard"><LayoutGrid size={15} />Dashboard<i className="dot" /></Link>
        <Link className="nav" to="/user-management"><Users size={15} />User Management</Link>
        <Link className="nav" to="/children-management"><Baby size={15} />Children Management</Link>
        <div className="sec-t">PLANNED MODULES</div>
        {planned.map(([I, t, h]) => (
          <a className="nav mut2" key={t}><I size={15} />{t}<span className={'soon' + (h ? ' h' : '')}>Soon</span></a>
        ))}
        <div className="sb-bot">
          <span className="av">AD</span>
          <div><b>Admin</b><small>Administrator</small></div>
          <LogOut size={14} onClick={handleLogout} style={{ marginLeft: 'auto', cursor: 'pointer' }} title="Logout" />
        </div>
      </aside>

      <div className="mainc">
        <header>
          <div className="mut"><span>Home</span> / <span className="chip b">Dashboard</span></div>
          <div className="hr">
            <span className="pill"><Calendar size={12} /> Academic Year 2026/2027</span>
            <span className="pill"><Bell size={12} color="#d97706" /></span>
            <span className="pill u"><span className="av y">TJ</span><div><b>Admin</b><small>Live Connected</small></div><ChevronDown size={12} /></span>
          </div>
        </header>

        <div className="body">
          <div className="hero">
            <div>
              <span className="chip y">★ Connected to PostgreSQL Backend API</span>
              <h2>Welcome back, Admin! 👋</h2>
              <p>Everything you need to manage your nursery, your team, and your little learners in one serene workspace.</p>
            </div>
            <div className="hbt">
              <Link className="btn sm" to="/user-management"><UserPlus size={13} /> + Add New User</Link>
              <Link className="btn w sm" to="/children-management"><Smile size={13} color="#d97706" /> + Add Child</Link>
            </div>
          </div>

          <h4 className="sh">
            <BarChart3 size={13} /> OVERVIEW METRICS
            <span>Live database values from localhost:5000</span>
          </h4>
          <div className="g4">
            {stats.map(([t, v, I, bg, c, s, sc]) => (
              <div className="card st" key={t}>
                <span className="ic r" style={{ background: bg }}><I size={15} color={c} /></span>
                <small>{t}</small>
                <div className="big">{loading ? '...' : v}</div>
                <p style={{ color: sc }}>• {s}</p>
              </div>
            ))}
          </div>

          <h4 className="sh"><Zap size={13} color="#d97706" /> QUICK ACTIONS</h4>
          <div className="g4">
            {Q.map(([I, t, d, tag, cta, bg, c, path]) => (
              <div
                className="card qa"
                key={t}
                style={{ cursor: path ? 'pointer' : 'default' }}
                onClick={() => path && nav(path)}
              >
                <span className="ic" style={{ background: bg }}><I size={15} color={c} /></span>
                <b>{t}</b>
                <p>{d}</p>
                <div className="qf">
                  <span className={'tag' + (tag.startsWith('Sprint') ? ' g' : '')}>{tag}</span>
                  <span className="cta">{cta} {tag.startsWith('Sprint') ? <ArrowRight size={11} /> : <Lock size={11} />}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="g2">
            <div className="card ra">
              <div className="rh">
                <div>
                  <b><Activity size={13} /> RECENT ACTIVITY</b>
                  <small>System audit log and activity feed</small>
                </div>
                <span className="chip b">Live Log</span>
              </div>
              {empty ? (
                <div className="empty">
                  <div className="ec"><Cloud size={40} color="#f4c76e" /></div>
                  <b>No Recent Activity Yet</b>
                  <p>New updates and actions will appear here as your nursery activity grows.</p>
                </div>
              ) : (
                acts.map(([I, bg, c, t, s, ago]) => (
                  <div className="act" key={t}>
                    <span className="ic s" style={{ background: bg }}><I size={13} color={c} /></span>
                    <div><b>{t}</b><small>{s}</small></div>
                    <em>{ago}</em>
                  </div>
                ))
              )}
              <div className="rf">
                <small>Audit compliance standard: FERPA &amp; Safeguarding</small>
                <a>View Full Log <ArrowRight size={11} /></a>
              </div>
            </div>

            <div className="card ra">
              <div className="rh"><b><Building2 size={13} /> NURSERY OVERVIEW</b></div>
              <small>Shortcuts to core operational databases</small>
              {[[Baby, 'Children Management', 'Rosters & child health notes', \`\${totalChildren} Enrolled\`, 'Classrooms active: 3', 'View Directory', '#dbeafe', '#2563eb', '#eff6ff', '/children-management'],
                [Users, 'Team Management', 'Staff, teachers & parents', \`\${totalUsers} Users\`, 'Educators & Parents', 'Manage Team', '#dcfce7', '#16a34a', '#f0fdf4', '/user-management'],
                [ClipboardList, pend ? 'Admissions' : 'No Pending Requests', pend ? 'Parent intake applications' : 'There are no admission requests', pend ? '5 Pending' : '0 Pending', pend ? 'Queue status: Open' : 'All caught up', 'View Queue', '#fee2e2', '#e11d48', '#fff1f2', null]
              ].map(([I, t, d, b, f, l, bg, c, cb, path]) => (
                <div className="ov" key={t} style={{ background: cb, cursor: path ? 'pointer' : 'default' }} onClick={() => path && nav(path)}>
                  <div className="ovt">
                    <span className="ic s" style={{ background: bg }}><I size={13} color={c} /></span>
                    <div><b>{t}</b><small>{d}</small></div>
                    <span className="chip" style={{ background: bg, color: c }}>{b}</span>
                  </div>
                  <div className="ovf">
                    <small>{f}</small>
                    <a style={{ color: c }}>{l} <ChevronRight size={10} /></a>
                  </div>
                </div>
              ))}
              <small className="info"><Info size={11} /> Metrics correspond to live registered database IDs in PostgreSQL.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(srcDir, 'Dashboard.jsx'), dashboardJsx, 'utf8');
console.log('✓ src/Dashboard.jsx updated');
console.log('\nAll files in nursery-admin updated successfully!');
