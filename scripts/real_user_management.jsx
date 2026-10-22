Created At: 2026-10-14T17:15:01+03:00
Completed At: 2026-10-14T17:15:06+03:00

				The command exited with code 0.
				Output:
				<truncated 1 lines>
        <div className="um-breadcrumb"><Link to="/dashboard">Home</Link><span>/</span><span className="um-crumb-current">User Management</span></div>
        <div className="um-header-actions">
          <span className="um-date"><Calendar size={12} />Monday, October 12, 2026</span>
          <button className="um-notification" aria-label="Notifications"><Bell size={14} /></button>
          <button className="um-profile"><span className="um-avatar yellow">TJ</span><span><b>Admin</b><small>NMS Superadmin</small></span><ChevronDown size={12} /></button>
        </div>
      </header>

      <main className="um-body">
        <div className="um-title-row">
          <div><h1>User Management</h1><p>Create and manage teacher and parent accounts.</p></div>
          <button className="um-add-button" onClick={() => setModalOpen(true)}><UserPlus size={14} />Add New User</button>
        </div>

        <section className="um-stats">
          <article className="um-stat"><div><small>TOTAL USERS</small><strong>{users.length}</strong><p>Teachers &amp; Parent accounts</p></div><span className="um-stat-icon blue"><Users size={19} /></span></article>
          <article className="um-stat"><div><small>ACTIVE USERS</small><strong>{activeUsers}<em>({(activeUsers / Math.max(users.length, 1) * 100).toFixed(1)}% ratio)</em></strong><p>Active status credentials</p></div><span className="um-stat-icon amber"><UserPlus size={19} /></span></article>
          <article className="um-stat"><div><small>INACTIVE USERS</small><strong>{users.length - activeUsers}<em>Pending intake</em></strong><p>Draft / pending onboarding</p></div><span className="um-stat-icon pink"><UserPlus size={19} /></span></article>
        </section>

        <section className="um-filters" aria-label="Filter users">
          <label className="um-search"><Search size={14} /><input placeholder="Search by name or email..." value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
          <label className="um-select-wrap"><SlidersHorizontal className="um-filter-icon" size={12} /><select aria-label="Filter by role" value={roleFilter} onChange={event => { setRoleFilter(event.target.value); setPage(1); }}><option>All Roles</option><option>Teacher</option><option>Parent</option></select><ChevronDown size={12} /></label>
          <label className="um-select-wrap"><select aria-label="Filter by status" value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }}><option>All Statuses</option><option>Active</option><option>Inactive</option></select><ChevronDown size={12} /></label>
          <button className="um-clear" onClick={clearFilters}><X size={12} />Clear Filters</button>
        </section>

        <section className="um-table-card">
          <div className="um-table-scroll"><table className="um-table">
            <thead><tr><th className="um-user-heading">USER</th><th>EMAIL ADDRESS</th><th>ROLE</th><th>ACCOUNT<br />STATUS</th><th>DATE<br />CREATED</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {visibleUsers.map(user => {
                const index = users.indexOf(user);
                return <tr key={`${user.email}-${index}`}>
                  <td><div className="um-user-cell"><span className={`um-avatar ${user.role === 'Teacher' ? 'blue' : 'pink'}`}>{user.initials}</span><span><b>{user.name}</b><small>{user.detail}</small></span></div></td>
                  <td>{user.email}</td>
                  <td><span className={`um-role ${user.role.toLowerCase()}`}>{user.role}</span></td>
                  <td><span className={`um-status ${user.status.toLowerCase()}`}><i />{user.status}</span></td>
                  <td>{user.date}</td>
                  <td className="um-action-cell"><button className="um-more" aria-label={`Actions for ${user.name}`} onClick={() => setActiveMenu(activeMenu === index ? null : index)}><Ellipsis size={16} /></button>{activeMenu === index && <div className="um-row-menu"><button onClick={() => toggleStatus(index)}>{user.status === 'Active' ? 'Deactivate user' : 'Activate user'}</button></div>}</td>
                </tr>;
              })}
              {!visibleUsers.length && <tr><td className="um-no-results" colSpan="6">No users match your filters.</td></tr>}
            </tbody>
          </table></div>
          <div className="um-table-footer">
            <span>Showing <b>{filteredUsers.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredUsers.length)}</b> of <b>{filteredUsers.length}</b> users</span>
            <div className="um-pagination"><label>Rows per page: <select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={6}>6 / page</option><option value={10}>10 / page</option><option value={24}>24 / page</option></select></label><button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(current => current - 1)}><ChevronLeft size={14} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button className={page === number ? 'current' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button aria-label="Next page" disabled={page === pageCount} onClick={() => setPage(current => current + 1)}><ChevronRight size={14} /></button></div>
          </div>
        </section>
      </main>
    </div>

    {modalOpen && <div className="um-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false); }}>
      <form className="um-modal" onSubmit={addUser}>
        <div className="um-modal-heading"><div className="um-user-modal-title"><span><UserPlus size={16} /></span><div><h2>Add New User</h2><p>Create a new teacher or parent account.</p></div></div><button type="button" aria-label="Close" onClick={() => setModalOpen(false)}><X size={16} /></button></div>
        <label>Full Name <i>*</i><input required value={newUser.name} onChange={event => setNewUser({ ...newUser, name: event.target.value })} /></label>
        <label>Email Address <i>*</i><input required type="email" value={newUser.email} onChange={event => setNewUser({ ...newUser, email: event.target.value })} /></label>
        <label>Role <i>*</i><select value={newUser.role} onChange={event => setNewUser({ ...newUser, role: event.target.value })}><option value="Teacher">Teacher (Nursery Staff)</option><option value="Parent">Parent / Guardian</option></select></label>
        <label>Temporary Password <i>*</i><span className="um-password-input"><input required type={showPassword ? 'text' : 'password'} value={newUser.password} onChange={event => { setNewUser({ ...newUser, password: event.target.value }); setPasswordError(false); }} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={13} /> : <Eye size={13} />}</button></span></label>
        <p className={`um-password-hint${passwordError ? ' error' : ''}`}><CircleHelp size={11} />{passwordError ? 'Use at least 8 characters with a number or symbol.' : 'Must be at least 8 characters with a number or symbol.'}</p>
        <fieldset className="um-status-field"><legend>Account Status</legend><label className={newUser.status === 'Active' ? 'checked' : ''}><input type="radio" name="account-status" value="Active" checked={newUser.status === 'Active'} onChange={() => setNewUser({ ...newUser, status: 'Active' })} /><span><b>Active</b><small>Immediate portal access</small></span></label><label className={newUser.status === 'Inactive' ? 'checked' : ''}><input type="radio" name="account-status" value="Inactive" checked={newUser.status === 'Inactive'} onChange={() => setNewUser({ ...newUser, status: 'Inactive' })} /><span><b>Inactive</b><small>Draft / pending approval</small></span></label></fieldset>
        <div className="um-modal-actions"><button type="button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit"><span>�</span>Create User</button></div>
      </form>
    </div>}
  </div>;
}


