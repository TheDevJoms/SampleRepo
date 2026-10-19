import { useEffect, useState } from 'react';
import './DashboardPage.css';
import { api } from '../services/api';
import { LOADING_DELAY_MS } from '../constants/loading';

const defaultSupplyForm = {
  name: '',
  quantity: 0,
  unit: 'pieces',
  reorder_level: 5,
  date_received: new Date().toISOString().split('T')[0],
  status: 'active',
};

const defaultMachineForm = {
  name: '',
  serial_number: '',
  model: '',
  location: '',
  status: 'operational',
};

const defaultUserForm = {
  username: '',
  password: '',
  role: 'staff',
  status: 'active',
};

function DashboardPage({ currentUser, onLogout, isLoggingOut = false }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isLowStockAlertDismissed, setIsLowStockAlertDismissed] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboard, setDashboard] = useState({
    users: 0,
    supplies: 0,
    machines: 0,
    supplies_list: [],
    machines_list: [],
  });
  const [users, setUsers] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [machines, setMachines] = useState([]);
  const [supplyForm, setSupplyForm] = useState(defaultSupplyForm);
  const [machineForm, setMachineForm] = useState(defaultMachineForm);
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [editingSupplyId, setEditingSupplyId] = useState(null);
  const [editingMachineId, setEditingMachineId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [supplySearch, setSupplySearch] = useState('');
  const [machineSearch, setMachineSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [supplyStatusFilter, setSupplyStatusFilter] = useState('all');
  const [machineStatusFilter, setMachineStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const refreshAll = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [dashboardData, userData, supplyData, machineData] = await Promise.all([
        api.getDashboard(),
        api.getUsers(),
        api.getSupplies(),
        api.getMachines(),
      ]);

      setDashboard(dashboardData);
      setUsers(userData);
      setSupplies(supplyData);
      setMachines(machineData);
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY_MS));
    } catch (refreshError) {
      setError(refreshError.message || 'Unable to load inventory data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const resetSupplyForm = () => {
    setSupplyForm(defaultSupplyForm);
    setEditingSupplyId(null);
    setIsSupplyModalOpen(false);
  };

  const openNewSupplyModal = () => {
    setSupplyForm(defaultSupplyForm);
    setEditingSupplyId(null);
    setIsSupplyModalOpen(true);
  };

  const resetMachineForm = () => {
    setMachineForm(defaultMachineForm);
    setEditingMachineId(null);
    setIsMachineModalOpen(false);
  };

  const openNewMachineModal = () => {
    setMachineForm(defaultMachineForm);
    setEditingMachineId(null);
    setIsMachineModalOpen(true);
  };

  const resetUserForm = () => {
    setUserForm(defaultUserForm);
    setEditingUserId(null);
    setIsUserModalOpen(false);
  };

  const openNewUserModal = () => {
    setUserForm(defaultUserForm);
    setEditingUserId(null);
    setIsUserModalOpen(true);
  };

  const handleSupplySubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setError('Only administrators can manage supplies.');
      return;
    }

    try {
      const payload = {
        ...supplyForm,
        quantity: Number(supplyForm.quantity),
        reorder_level: Number(supplyForm.reorder_level),
      };

      if (editingSupplyId) {
        await api.updateSupply(editingSupplyId, payload);
      } else {
        await api.createSupply(payload);
      }

      resetSupplyForm();
      await refreshAll();
    } catch (submitError) {
      setError(submitError.message || 'Unable to save supply.');
    }
  };

  const handleMachineSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setError('Only administrators can manage machines.');
      return;
    }

    try {
      const payload = { ...machineForm };

      if (editingMachineId) {
        await api.updateMachine(editingMachineId, payload);
      } else {
        await api.createMachine(payload);
      }

      resetMachineForm();
      await refreshAll();
    } catch (submitError) {
      setError(submitError.message || 'Unable to save machine.');
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setError('Only administrators can manage users.');
      return;
    }

    try {
      const payload = { ...userForm };

      if (editingUserId) {
        if (!payload.password) {
          delete payload.password;
        }
        await api.updateUser(editingUserId, payload);
      } else {
        if (!payload.password) {
          throw new Error('Password is required for new users.');
        }
        await api.createUser(payload);
      }

      resetUserForm();
      await refreshAll();
    } catch (submitError) {
      setError(submitError.message || 'Unable to save user.');
    }
  };

  const handleDeleteSupply = async (id) => {
    try {
      await api.deleteSupply(id);
      await refreshAll();
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete supply.');
    }
  };

  const handleDeleteMachine = async (id) => {
    try {
      await api.deleteMachine(id);
      await refreshAll();
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete machine.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      await refreshAll();
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete user.');
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const currentRoleLabel = isAdmin ? 'Admin' : 'Staff';
  const canManageRecords = isAdmin;
  const lowStockSupplies = (supplies || []).filter((item) => item.status === 'low_stock');
  const filteredSupplies = (supplies || []).filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(supplySearch.toLowerCase());
    const matchesStatus = supplyStatusFilter === 'all' || item.status === supplyStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredMachines = (machines || []).filter((machine) => {
    const matchesSearch = machine.name.toLowerCase().includes(machineSearch.toLowerCase()) || machine.model.toLowerCase().includes(machineSearch.toLowerCase());
    const matchesStatus = machineStatusFilter === 'all' || machine.status === machineStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const clearSupplyFilters = () => {
    setSupplySearch('');
    setSupplyStatusFilter('all');
  };

  const showLowStockSupplies = () => {
    setActiveSection('supplies');
    setSupplySearch('');
    setSupplyStatusFilter('low_stock');
    setIsLowStockAlertDismissed(true);
  };

  const clearMachineFilters = () => {
    setMachineSearch('');
    setMachineStatusFilter('all');
  };

  const clearUserFilters = () => {
    setUserSearch('');
    setUserRoleFilter('all');
    setUserStatusFilter('all');
  };

  const summaryCards = [
    { label: 'Total Users', value: dashboard.users || users.length, accent: 'blue' },
    { label: 'Total Supplies', value: dashboard.supplies || supplies.length, accent: 'green' },
    { label: 'Total Machines', value: dashboard.machines || machines.length, accent: 'amber' },
  ];

  const supplyHealthData = [
    { label: 'Active', value: (supplies || []).filter((item) => item.status === 'active').length, color: '#22c55e' },
    { label: 'Low stock', value: (supplies || []).filter((item) => item.status === 'low_stock').length, color: '#f59e0b' },
    { label: 'Discontinued', value: (supplies || []).filter((item) => item.status === 'discontinued').length, color: '#ef4444' },
  ];

  const machineHealthData = [
    { label: 'Operational', value: (machines || []).filter((item) => item.status === 'operational').length, color: '#3b82f6' },
    { label: 'Maintenance', value: (machines || []).filter((item) => item.status === 'maintenance').length, color: '#f59e0b' },
    { label: 'Retired', value: (machines || []).filter((item) => item.status === 'retired').length, color: '#ef4444' },
  ];

  const navItems = [
    { key: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2-fill' },
    { key: 'users', label: 'Users', icon: 'bi bi-people-fill' },
    { key: 'supplies', label: 'Supplies', icon: 'bi bi-box-seam' },
    { key: 'machines', label: 'Machines', icon: 'bi bi-gear-wide-connected' },
  ];

  return (
    <div className="dashboard-shell">
      {isLoggingOut && (
        <div className="dashboard-loading-overlay logout-overlay" aria-live="polite" aria-label="Logging out">
          <div className="page-loader-symbol">
            <span>P</span>
          </div>
          <p>Logging out...</p>
        </div>
      )}

      <aside className={`sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          <button type="button" className="burger-button btn btn-link text-white p-0" onClick={() => setSidebarOpen((current) => !current)}>
            ☰
          </button>
          {sidebarOpen && (
            <div className="brand-block">
              <span className="brand-mark-mini">P</span>
              <span className="brand-name">Polyprime</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              <span className={`nav-icon ${item.icon}`} aria-label={`${item.label} icon`} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <button type="button" className="sidebar-logout btn btn-outline-light btn-sm" onClick={onLogout} disabled={isLoggingOut}>
          {sidebarOpen ? (isLoggingOut ? 'Logging out...' : 'Logout') : '⎋'}
        </button>
      </aside>

      <main className="main-panel">
        <header className="dashboard-header">
          <div className="dashboard-heading">
            <div className="brand-mark" aria-hidden="true">PP</div>
            <div className="dashboard-title-block">
              <p className="dashboard-kicker">Polyprime / Inventory</p>
              <h1>{activeSection === 'overview' ? 'Inventory Dashboard' : `${activeSection.charAt(0).toUpperCase()}${activeSection.slice(1)}`}</h1>
            </div>
          </div>
          <div className="dashboard-header-tools">
            <div className="header-time-block">
              <span className="time-label">Today</span>
              <strong>{currentTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              <span className="current-time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="user-pill">
              <span className="user-avatar" aria-hidden="true">{(currentUser?.username || 'U').slice(0, 1).toUpperCase()}</span>
              <span className="user-details">
                <span className="user-label">{currentUser?.username || 'User'}</span>
                <span className={`user-role ${isAdmin ? 'admin' : 'staff'}`}>{currentRoleLabel}</span>
              </span>
            </div>
            <div className="header-actions">
              <button type="button" className="secondary-button btn btn-outline-secondary" onClick={refreshAll} disabled={isLoggingOut}>
                Refresh
              </button>
              <button type="button" className="primary-button btn btn-primary" onClick={onLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </header>

        {error && <div className="dashboard-error">{error}</div>}

        {isLoading ? (
          <div className="dashboard-loading-overlay" aria-live="polite" aria-label="Loading inventory data">
            <div className="page-loader-symbol">
              <span>P</span>
            </div>
            <p>Loading inventory data...</p>
          </div>
        ) : (
          <>
            {lowStockSupplies.length > 0 && !isLowStockAlertDismissed && (
              <div className="alert-banner" role="status">
                <span>{lowStockSupplies.length} item(s) marked as low stock.</span>
                <button type="button" className="alert-action" onClick={showLowStockSupplies}>
                  View low-stock supplies
                </button>
              </div>
            )}

            {activeSection === 'overview' && (
              <>
                <section className="stats-grid">
                  {summaryCards.map((card) => (
                    <article key={card.label} className={`stat-card ${card.accent}`}>
                      <span className="card-label">{card.label}</span>
                      <strong>{card.value}</strong>
                      <small>Updated today</small>
                    </article>
                  ))}
                </section>

                <section className="overview-panels">
                  <div className="panel chart-panel">
                    <h2>Supply health</h2>
                    <div className="chart-list">
                      {supplyHealthData.map((item) => {
                        const max = Math.max(...supplyHealthData.map((entry) => entry.value), 1);
                        const width = (item.value / max) * 100;

                        return (
                          <div className="chart-row" key={item.label}>
                            <div className="chart-meta">
                              <span>{item.label}</span>
                              <strong>{item.value}</strong>
                            </div>
                            <div className="chart-track">
                              <div className="chart-fill" style={{ width: `${width}%`, background: item.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="panel chart-panel">
                    <h2>Machine availability</h2>
                    <div className="chart-list">
                      {machineHealthData.map((item) => {
                        const max = Math.max(...machineHealthData.map((entry) => entry.value), 1);
                        const width = (item.value / max) * 100;

                        return (
                          <div className="chart-row" key={item.label}>
                            <div className="chart-meta">
                              <span>{item.label}</span>
                              <strong>{item.value}</strong>
                            </div>
                            <div className="chart-track">
                              <div className="chart-fill" style={{ width: `${width}%`, background: item.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="content-grid">
                  <div className="panel">
                    <h2>Low stock supplies</h2>
                    <div className="list-table compact-table">
                      <div className="list-row header-row">
                        <span>Name</span>
                        <span>Qty</span>
                        <span>Status</span>
                      </div>

                      {lowStockSupplies.map((item) => (
                        <div key={item.uid || item.id} className="list-row">
                          <span>{item.name}</span>
                          <span>{item.quantity}</span>
                          <span className={`status-badge ${item.status || 'active'}`}>{item.status || 'active'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel">
                    <h2>Machine health</h2>
                    <div className="list-table compact-table">
                      <div className="list-row header-row">
                        <span>Name</span>
                        <span>Model</span>
                        <span>Status</span>
                      </div>

                      {(machines || []).map((machine) => (
                        <div key={machine.uid || machine.id} className="list-row">
                          <span>{machine.name}</span>
                          <span>{machine.model}</span>
                          <span className={`status-badge ${machine.status || 'operational'}`}>{machine.status || 'operational'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeSection === 'users' && (
              <section className="resource-panel entity-page">
                <div className="panel resource-list-panel">
                  <div className="entity-list-header">
                    <div className="form-section-header">
                      <span className="section-kicker">Users</span>
                      <h2>Records</h2>
                    </div>
                    {canManageRecords && (
                      <button type="button" className="primary-button" onClick={openNewUserModal}>Add user</button>
                    )}
                  </div>
                  {!canManageRecords && <p className="access-note">Staff members can view user details, but management actions are restricted to administrators.</p>}
                  <div className="filter-row">
                    <div className="filter-field">
                      <label htmlFor="user-search">Search</label>
                      <input
                        id="user-search"
                        type="text"
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        placeholder="Search users"
                      />
                    </div>
                    <div className="filter-field">
                      <label htmlFor="user-role-filter">Role</label>
                      <select id="user-role-filter" value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value)}>
                        <option value="all">All roles</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    <div className="filter-field">
                      <label htmlFor="user-status-filter">Status</label>
                      <select id="user-status-filter" value={userStatusFilter} onChange={(event) => setUserStatusFilter(event.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <div className="list-table">
                    <div className="list-row header-row user-row">
                      <span>Username</span>
                      <span>Role</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>

                    {(filteredUsers || []).length === 0 ? (
                      <div className="empty-list-state">
                        <strong>No users match the current filters.</strong>
                        <span>Try a different search or clear the filters.</span>
                        <button type="button" className="secondary-button small-button" onClick={clearUserFilters}>Clear filters</button>
                      </div>
                    ) : (
                      (filteredUsers || []).map((user) => (
                        <div key={user.uid || user.id} className="list-row user-row">
                          <span>{user.username}</span>
                          <span>{user.role}</span>
                          <span className={`status-badge ${user.status}`}>{user.status}</span>
                          <div className="row-actions">
                            {canManageRecords && (
                              <>
                                <button
                                  type="button"
                                  className="secondary-button small-button"
                                  onClick={() => {
                                    setUserForm({
                                      username: user.username,
                                      password: '',
                                      role: user.role,
                                      status: user.status,
                                    });
                                    setEditingUserId(user.uid || user.id);
                                    setIsUserModalOpen(true);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="delete-button small-button"
                                  onClick={() => handleDeleteUser(user.uid || user.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {isUserModalOpen && canManageRecords && (
                  <div
                    className="entity-modal-backdrop"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) resetUserForm();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') resetUserForm();
                    }}
                  >
                    <section className="entity-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
                      <div className="entity-modal-header">
                        <div>
                          <span className="section-kicker">Users</span>
                          <h2 id="user-modal-title">{editingUserId ? 'Edit user' : 'Add new user'}</h2>
                        </div>
                        <button type="button" className="secondary-button small-button" onClick={resetUserForm}>Close</button>
                      </div>
                      <form className="resource-form entity-modal-form" onSubmit={handleUserSubmit}>
                        <div className="form-field-group">
                          <label htmlFor="user-username"><span className="label-text">Username</span><span className="required-mark">*</span></label>
                          <input id="user-username" className="form-control" name="username" value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} placeholder="Username" required autoFocus />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="user-password"><span className="label-text">Password</span>{!editingUserId && <span className="required-mark">*</span>}</label>
                          <input id="user-password" className="form-control" name="password" type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder={editingUserId ? 'New password (optional)' : 'Password'} required={!editingUserId} />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="user-role">Role</label>
                          <select id="user-role" className="form-select" name="role" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="user-status">Status</label>
                          <select id="user-status" className="form-select" name="status" value={userForm.status} onChange={(event) => setUserForm((current) => ({ ...current, status: event.target.value }))}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                        <div className="form-actions">
                          <button type="button" className="secondary-button" onClick={resetUserForm}>Cancel</button>
                          <button type="submit" className="primary-button">{editingUserId ? 'Save changes' : 'Create user'}</button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </section>
            )}

            {activeSection === 'supplies' && (
              <section className="resource-panel supplies-page">
                <div className="panel resource-list-panel">
                  <div className="supplies-list-header">
                    <div className="form-section-header">
                      <span className="section-kicker">Supplies</span>
                      <h2>Records</h2>
                    </div>
                    {canManageRecords && (
                      <button type="button" className="primary-button" onClick={openNewSupplyModal}>
                        Add supply
                      </button>
                    )}
                  </div>
                  <div className="filter-row">
                    <div className="filter-field">
                      <label htmlFor="supply-search">Search</label>
                      <input
                        id="supply-search"
                        type="text"
                        value={supplySearch}
                        onChange={(event) => setSupplySearch(event.target.value)}
                        placeholder="Search supplies"
                      />
                    </div>
                    <div className="filter-field">
                      <label htmlFor="supply-status-filter">Status</label>
                      <select id="supply-status-filter" value={supplyStatusFilter} onChange={(event) => setSupplyStatusFilter(event.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="low_stock">Low stock ({lowStockSupplies.length})</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>
                  {supplyStatusFilter === 'low_stock' && (
                    <div className="filter-summary" role="status">
                      Showing {filteredSupplies.length} of {lowStockSupplies.length} low-stock {lowStockSupplies.length === 1 ? 'supply' : 'supplies'}.
                    </div>
                  )}
                  <div className="list-table">
                    <div className="list-row header-row supply-row">
                      <span>Name</span>
                      <span>Qty</span>
                      <span>Unit</span>
                      <span>Date received</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>

                    {(filteredSupplies || []).length === 0 ? (
                      <div className="empty-list-state">
                        <strong>No supplies match the current filters.</strong>
                        <span>Try a different search or clear the filters.</span>
                        <button type="button" className="secondary-button small-button" onClick={clearSupplyFilters}>Clear filters</button>
                      </div>
                    ) : (
                      (filteredSupplies || []).map((item) => (
                        <div key={item.uid || item.id} className="list-row supply-row">
                          <span>{item.name}</span>
                          <span>{item.quantity}</span>
                          <span>{item.unit}</span>
                          <span>{item.date_received ? new Date(item.date_received).toLocaleDateString() : '—'}</span>
                          <span className={`status-badge ${item.status || 'active'}`}>{item.status || 'active'}</span>
                          <div className="row-actions">
                            {canManageRecords && (
                              <>
                                <button
                                  type="button"
                                  className="secondary-button small-button"
                                  onClick={() => {
                                    setSupplyForm({
                                      name: item.name,
                                      quantity: item.quantity,
                                      unit: item.unit,
                                      reorder_level: item.reorder_level,
                                      date_received: item.date_received || new Date().toISOString().split('T')[0],
                                      status: item.status || 'active',
                                    });
                                    setEditingSupplyId(item.uid || item.id);
                                    setIsSupplyModalOpen(true);
                                  }}
                                >
                                  Edit
                                </button>
                                <button type="button" className="delete-button small-button" onClick={() => handleDeleteSupply(item.uid || item.id)}>
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {isSupplyModalOpen && canManageRecords && (
                  <div
                    className="supply-modal-backdrop"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) resetSupplyForm();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') resetSupplyForm();
                    }}
                  >
                    <section className="supply-modal" role="dialog" aria-modal="true" aria-labelledby="supply-modal-title">
                      <div className="supply-modal-header">
                        <div>
                          <span className="section-kicker">Supplies</span>
                          <h2 id="supply-modal-title">{editingSupplyId ? 'Edit supply' : 'Add new supply'}</h2>
                        </div>
                        <button type="button" className="secondary-button small-button" onClick={resetSupplyForm}>
                          Close
                        </button>
                      </div>
                      <form className="resource-form supply-modal-form" onSubmit={handleSupplySubmit}>
                        <div className="form-field-group">
                          <label htmlFor="supply-name"><span className="label-text">Supply name</span><span className="required-mark">*</span></label>
                          <input id="supply-name" className="form-control" name="name" value={supplyForm.name} onChange={(event) => setSupplyForm((current) => ({ ...current, name: event.target.value }))} placeholder="Supply name" required autoFocus />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="supply-quantity"><span className="label-text">Quantity</span><span className="required-mark">*</span></label>
                          <input id="supply-quantity" className="form-control" name="quantity" type="number" min="0" value={supplyForm.quantity} onChange={(event) => setSupplyForm((current) => ({ ...current, quantity: event.target.value }))} placeholder="Quantity" required />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="supply-unit"><span className="label-text">Unit</span><span className="required-mark">*</span></label>
                          <select id="supply-unit" className="form-select" name="unit" value={supplyForm.unit} onChange={(event) => setSupplyForm((current) => ({ ...current, unit: event.target.value }))} required>
                            <option value="pieces">Pieces</option>
                            <option value="boxes">Boxes</option>
                            <option value="liters">Liters</option>
                            <option value="kg">Kilograms</option>
                            <option value="rolls">Rolls</option>
                          </select>
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="supply-reorder"><span className="label-text">Reorder level</span><span className="required-mark">*</span></label>
                          <input id="supply-reorder" className="form-control" name="reorder_level" type="number" min="0" value={supplyForm.reorder_level} onChange={(event) => setSupplyForm((current) => ({ ...current, reorder_level: event.target.value }))} placeholder="Reorder level" required />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="supply-date"><span className="label-text">Date received</span><span className="required-mark">*</span></label>
                          <input id="supply-date" className="form-control" name="date_received" type="date" value={supplyForm.date_received || ''} onChange={(event) => setSupplyForm((current) => ({ ...current, date_received: event.target.value }))} required />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="supply-status"><span className="label-text">Status</span></label>
                          <select id="supply-status" className="form-select" name="status" value={supplyForm.status} onChange={(event) => setSupplyForm((current) => ({ ...current, status: event.target.value }))}>
                            <option value="active">Active</option>
                            <option value="low_stock">Low stock</option>
                            <option value="discontinued">Discontinued</option>
                          </select>
                        </div>
                        <div className="form-actions">
                          <button type="button" className="secondary-button" onClick={resetSupplyForm}>Cancel</button>
                          <button type="submit" className="primary-button">{editingSupplyId ? 'Save changes' : 'Create supply'}</button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </section>
            )}

            {activeSection === 'machines' && (
              <section className="resource-panel entity-page">
                <div className="panel resource-list-panel">
                  <div className="entity-list-header">
                    <div className="form-section-header">
                      <span className="section-kicker">Machines</span>
                      <h2>Records</h2>
                    </div>
                    {canManageRecords && (
                      <button type="button" className="primary-button" onClick={openNewMachineModal}>Add machine</button>
                    )}
                  </div>
                  {!canManageRecords && <p className="access-note">Staff members can view machine details, but management actions are restricted to administrators.</p>}
                  <div className="filter-row">
                    <div className="filter-field">
                      <label htmlFor="machine-search">Search</label>
                      <input
                        id="machine-search"
                        type="text"
                        value={machineSearch}
                        onChange={(event) => setMachineSearch(event.target.value)}
                        placeholder="Search machines"
                      />
                    </div>
                    <div className="filter-field">
                      <label htmlFor="machine-status-filter">Status</label>
                      <select id="machine-status-filter" value={machineStatusFilter} onChange={(event) => setMachineStatusFilter(event.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="operational">Operational</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>
                  <div className="list-table">
                    <div className="list-row header-row machine-row">
                      <span>Name</span>
                      <span>Model</span>
                      <span>Location</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>

                    {(filteredMachines || []).length === 0 ? (
                      <div className="empty-list-state">
                        <strong>No machines match the current filters.</strong>
                        <span>Try a different search or clear the filters.</span>
                        <button type="button" className="secondary-button small-button" onClick={clearMachineFilters}>Clear filters</button>
                      </div>
                    ) : (
                      (filteredMachines || []).map((machine) => (
                        <div key={machine.uid || machine.id} className="list-row machine-row">
                          <span>{machine.name}</span>
                          <span>{machine.model}</span>
                          <span>{machine.location}</span>
                          <span className={`status-badge ${machine.status || 'operational'}`}>{machine.status || 'operational'}</span>
                          <div className="row-actions">
                            {canManageRecords && (
                              <>
                                <button
                                  type="button"
                                  className="secondary-button small-button"
                                  onClick={() => {
                                    setMachineForm({
                                      name: machine.name,
                                      serial_number: machine.serial_number,
                                      model: machine.model,
                                      location: machine.location,
                                      status: machine.status || 'operational',
                                    });
                                    setEditingMachineId(machine.uid || machine.id);
                                    setIsMachineModalOpen(true);
                                  }}
                                >
                                  Edit
                                </button>
                                <button type="button" className="delete-button small-button" onClick={() => handleDeleteMachine(machine.uid || machine.id)}>
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {isMachineModalOpen && canManageRecords && (
                  <div
                    className="entity-modal-backdrop"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) resetMachineForm();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') resetMachineForm();
                    }}
                  >
                    <section className="entity-modal" role="dialog" aria-modal="true" aria-labelledby="machine-modal-title">
                      <div className="entity-modal-header">
                        <div>
                          <span className="section-kicker">Machines</span>
                          <h2 id="machine-modal-title">{editingMachineId ? 'Edit machine' : 'Add new machine'}</h2>
                        </div>
                        <button type="button" className="secondary-button small-button" onClick={resetMachineForm}>Close</button>
                      </div>
                      <form className="resource-form entity-modal-form" onSubmit={handleMachineSubmit}>
                        <div className="form-field-group">
                          <label htmlFor="machine-name"><span className="label-text">Machine name</span><span className="required-mark">*</span></label>
                          <input id="machine-name" className="form-control" name="name" value={machineForm.name} onChange={(event) => setMachineForm((current) => ({ ...current, name: event.target.value }))} placeholder="Machine name" required autoFocus />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="machine-serial"><span className="label-text">Serial number</span><span className="required-mark">*</span></label>
                          <input id="machine-serial" className="form-control" name="serial_number" value={machineForm.serial_number} onChange={(event) => setMachineForm((current) => ({ ...current, serial_number: event.target.value }))} placeholder="Serial number" required />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="machine-model"><span className="label-text">Model</span><span className="required-mark">*</span></label>
                          <input id="machine-model" className="form-control" name="model" value={machineForm.model} onChange={(event) => setMachineForm((current) => ({ ...current, model: event.target.value }))} placeholder="Model" required />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="machine-location"><span className="label-text">Location</span><span className="required-mark">*</span></label>
                          <input id="machine-location" className="form-control" name="location" value={machineForm.location} onChange={(event) => setMachineForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" required />
                        </div>
                        <div className="form-field-group">
                          <label htmlFor="machine-status">Status</label>
                          <select id="machine-status" className="form-select" name="status" value={machineForm.status} onChange={(event) => setMachineForm((current) => ({ ...current, status: event.target.value }))}>
                            <option value="operational">Operational</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retired">Retired</option>
                          </select>
                        </div>
                        <div className="form-actions">
                          <button type="button" className="secondary-button" onClick={resetMachineForm}>Cancel</button>
                          <button type="submit" className="primary-button">{editingMachineId ? 'Save changes' : 'Create machine'}</button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
