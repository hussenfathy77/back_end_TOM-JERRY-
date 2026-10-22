Created At: 2026-10-14T17:15:54+03:00
Completed At: 2026-10-14T17:16:02+03:00

				The command exited with code 0.
				Output:
				<truncated 77 lines>
      <div className="um-account"><span className="um-avatar admin">AD</span><div><b>Admin</b><small>Administrator</small></div><LogOut size={14} onClick={() => navigate('/login')} /></div>
    </aside>

    <div className="um-content">
      <header className="um-header">
        <div className="um-breadcrumb"><Link to="/dashboard">Home</Link><span>/</span><span className="um-crumb-current">Children Management</span></div>
        <div className="um-header-actions">
          <span className="um-date"><Calendar size={12} />Monday, October 12, 2026</span>
          <button className="um-notification" aria-label="Notifications"><Bell size={14} /></button>
          <button className="um-profile"><span className="um-avatar yellow">TJ</span><span><b>Admin</b><small>NMS Superadmin</small></span><ChevronDown size={12} /></button>
        </div>
      </header>

      <main className="um-body cm-body">
        <div className="um-title-row">
          <div><h1>Children Management</h1><p>Manage children's profiles and records.</p></div>
          <button className="um-add-button" onClick={() => setModalOpen(true)}><Plus size={14} />Add New Child</button>
        </div>

        <section className="um-stats cm-stats">
          <article className="um-stat"><div><small>TOTAL CHILDREN</small><strong>{totalChildren}<span className="cm-stat-note"> +4</span></strong><p>Active nursery cohort</p></div><span className="um-stat-icon green"><Baby size={19} /></span></article>
          <article className="um-stat"><div><small>RECENTLY ENROLLED</small><strong>{children.length}<span className="cm-stat-note new">New</span></strong><p>Active intake past 14 days</p></div><span className="um-stat-icon amber"><Clock3 size={19} /></span></article>
          <article className="um-stat"><div><small>REQUIRES ATTENTION</small><strong>3<span className="cm-stat-note alert">Pending intake</span></strong><p>Medical or guardian update needed</p></div><span className="um-stat-icon pink"><AlertTriangle size={18} /></span></article>
        </section>

        <section className="um-filters cm-filters" aria-label="Filter children">
          <label className="um-search"><Search size={14} /><input placeholder="Search by child name or parent name..." value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
          <label className="um-select-wrap"><span>Gender:</span><select aria-label="Filter by gender" value={gender} onChange={event => { setGender(event.target.value); setPage(1); }}><option value="All">All</option><option value="Boy">Boy</option><option value="Girl">Girl</option></select><ChevronDown size={12} /></label>
          <button className="um-clear" onClick={clearFilters}><X size={12} />Clear Filters</button>
        </section>

        <section className="um-table-card cm-table-card">
          <div className="um-table-scroll"><table className="um-table cm-table">
            <thead><tr><th>CHILD</th><th>DATE OF BIRTH</th><th>GENDER</th><th>PARENT / GUARDIAN</th><th>CONTACT NUMBER</th><th>DATE ADDED</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {visibleChildren.map((child, index) => <tr key={`${child.name}-${index}`}>
                <td><div className="um-user-cell"><span className={`um-avatar ${child.tone}`}>{child.initials}</span><span><b>{child.name}</b><small>{child.room}</small></span></div></td>
                <td>{child.birth}</td>
                <td><span className={`cm-gender ${child.gender.toLowerCase()}`}>{child.gender}</span></td>
                <td><span className="cm-guardian"><b>{child.guardian}</b><small>{child.email}</small></span></td>
                <td className="cm-phone">{child.phone}</td>
                <td>{child.date}</td>
                <td className="um-action-cell"><button className="um-more" aria-label={`Actions for ${child.name}`} onClick={() => setActiveMenu(activeMenu === index ? null : index)}><Ellipsis size={16} /></button>{activeMenu === index && <div className="um-row-menu"><button onClick={() => setActiveMenu(null)}>View child profile</button></div>}</td>
              </tr>)}
              {!visibleChildren.length && <tr><td className="um-no-results" colSpan="7">No children match your filters.</td></tr>}
            </tbody>
          </table></div>
          <div className="um-table-footer">
            <span>Showing <b>{filteredChildren.length ? (page - 1) * 6 + 1 : 0}-{Math.min(page * 6, filteredChildren.length)}</b> of <b>{filteredChildren.length === children.length ? totalChildren : filteredChildren.length}</b> children</span>
            <div className="um-pagination"><label>Rows per page: <select defaultValue="6"><option value="6">6 / page</option></select></label><button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(current => current - 1)}><ChevronLeft size={14} /></button>{[1, 2, 3, 4].map(number => <button className={page === number ? 'current' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button aria-label="Next page" onClick={() => setPage(current => Math.min(current + 1, 4))}><ChevronRight size={14} /></button></div>
          </div>
        </section>
      </main>
    </div>

    {modalOpen && <div className="um-modal-backdrop cm-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false); }}>
      <form className="um-modal cm-modal" onSubmit={createChild}>
        <div className="um-modal-heading"><div className="cm-modal-title"><span><UserPlus size={17} /></span><div><h2>Add New Child</h2><p>Create a child profile in the nursery system.</p></div></div><button type="button" aria-label="Close" onClick={() => setModalOpen(false)}><X size={17} /></button></div>
        <label>Full Name <i>*</i><input required value={newChild.name} onChange={event => setNewChild({ ...newChild, name: event.target.value })} placeholder="Enter child's full name" /></label>
        <div className="cm-form-row">
          <label>Date of Birth <i>*</i><span className="cm-input-icon"><input required type="date" value={newChild.birth} onChange={event => setNewChild({ ...newChild, birth: event.target.value })} /><CalendarDays size={14} /></span></label>
          <label>Gender <i>*</i><select value={newChild.gender} onChange={event => setNewChild({ ...newChild, gender: event.target.value })}><option value="Boy">Boy (Male)</option><option value="Girl">Girl (Female)</option></select></label>
        </div>
        <label>Parent / Guardian Account <i>*</i><select value={newChild.guardian} onChange={event => setNewChild({ ...newChild, guardian: event.target.value })}>{guardianAccounts.map(account => <option key={account.name} value={account.name}>{account.name} ({account.email})</option>)}</select></label>
        <label>Parent / Guardian Contact Number<input value={newChild.phone} onChange={event => setNewChild({ ...newChild, phone: event.target.value })} placeholder="+1 (555) 234-8901" /></label>
        <label>Additional Notes &amp; Allergies <small>(optional)</small><textarea value={newChild.notes} onChange={event => setNewChild({ ...newChild, notes: event.target.value })} placeholder="Add any important notes or allergies" /></label>
        <div className="um-modal-actions"><button type="button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit"><span>�</span>Create Child</button></div>
      </form>
    </div>}
  </div>;
}

const guardianAccounts = [
  { name: 'Sarah Ahmed', email: 'sarah.ahmed@tomjerrynursery.com', phone: '+1 (555) 234-8901' },
  { name: 'David Lin', email: 'david.lin@example.com', phone: '+1 (555) 876-1234' },
  { name: 'Elena Brooks', email: 'elena.brooks@sample.org', phone: '+1 (555) 345-6789' },
  { name: 'Priya Patel', email: 'patel.priya@work.co', phone: '+1 (555) 981-2345' },
  { name: 'Marcus Vance', email: 'marcus.vance@mail.com', phone: '+1 (555) 432-1898' },
  { name: 'Tariq Chen', email: 'tariq.chen@provider.org', phone: '+1 (555) 678-9912' }
];


