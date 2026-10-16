import { useEffect, useState } from 'react';
import './DashboardPage.css';
import { api } from '../services/api';

const defaultSupplyForm = {
  name: '',
  quantity: 0,
  unit: 'pieces',
  reorder_level: 5,
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

function DashboardPage({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
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
  const [supplyStatusFilter, setSupplyStatusFilter] = useState('all');
  const [machineStatusFilter, setMachineStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshAll = async () => {
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
  };

  const resetMachineForm = () => {
    setMachineForm(defaultMachineForm);
    setEditingMachineId(null);
  };

  const resetUserForm = () => {
    setUserForm(defaultUserForm);
    setEditingUserId(null);
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
  const lowStockSupplies = (supplies || []).filter((item) => item.status === 'low_stock' || Number(item.quantity) <= Number(item.reorder_level || 0));
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

  const summaryCards = [
    { label: 'Total Users', value: dashboard.users || users.length, accent: 'blue' },
    { label: 'Total Supplies', value: dashboard.supplies || supplies.length, accent: 'green' },
    { label: 'Total Machines', value: dashboard.machines || machines.length, accent: 'amber' },
  ];

  const navItems = [
    { key: 'overview', label: 'Overview', icon: '⌂' },
    { key: 'users', label: 'Users', icon: '👤' },
    { key: 'supplies', label: 'Supplies', icon: '📦' },
    { key: 'machines', label: 'Machines', icon: '⚙️' },
  ];

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          <button type="button" className="burger-button btn btn-link text-white p-0" onClick={() => setSidebarOpen((current) => !current)}>
            ☰
          </button>
          {sidebarOpen && <span className="brand-name">Ops Suite</span>}
        </div>

        <nav className="sidebar-nav" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              <span className="nav-icon" aria-label={`${item.label} icon`}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <button type="button" className="sidebar-logout btn btn-outline-light btn-sm" onClick={onLogout}>
          {sidebarOpen ? 'Logout' : '⎋'}
        </button>
      </aside>

      <main className="main-panel">
        <header className="dashboard-header d-flex justify-content-between align-items-center">
          <div>
            <p className="dashboard-kicker">Operations overview</p>
            <h1>{activeSection === 'overview' ? 'Inventory Dashboard' : `${activeSection.charAt(0).toUpperCase()}${activeSection.slice(1)}`}</h1>
          </div>
          <div className="header-actions d-flex gap-2">
            <button type="button" className="secondary-button btn btn-outline-secondary" onClick={refreshAll}>
              Refresh
            </button>
            <button type="button" className="primary-button btn btn-primary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {error && <div className="dashboard-error">{error}</div>}

        {isLoading ? (
          <p className="loading-text">Loading inventory data...</p>
        ) : (
          <>
            {lowStockSupplies.length > 0 && (
              <div className="alert-banner">
                {lowStockSupplies.length} item(s) need attention: low stock or reorder threshold reached.
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

                <section className="content-grid">
                  <div className="panel">
                    <h2>Low stock supplies</h2>
                    <div className="list-table compact-table">
                      <div className="list-row header-row">
                        <span>Name</span>
                        <span>Qty</span>
                        <span>Status</span>
                      </div>

                      {(supplies || []).map((item) => (
                        <div key={item.id} className="list-row">
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
                        <div key={machine.id} className="list-row">
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
              <section className="resource-panel">
                <div className="panel resource-form-panel">
                  <h2>{editingUserId ? 'Edit user' : 'Add new user'}</h2>
                  {!isAdmin && <p className="access-note">Only administrators can manage users.</p>}
                  <form className="resource-form row g-3" onSubmit={handleUserSubmit}>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="username"
                        value={userForm.username}
                        onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
                        placeholder="Username"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="password"
                        type="password"
                        value={userForm.password}
                        onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder={editingUserId ? 'New password (optional)' : 'Password'}
                        required={!editingUserId}
                      />
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        name="role"
                        value={userForm.role}
                        onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        name="status"
                        value={userForm.status}
                        onChange={(event) => setUserForm((current) => ({ ...current, status: event.target.value }))}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div className="col-12 form-actions d-flex gap-2">
                      <button type="submit" className="primary-button btn btn-primary" disabled={!isAdmin}>
                        {editingUserId ? 'Save user' : 'Create user'}
                      </button>
                      {editingUserId && (
                        <button type="button" className="secondary-button btn btn-outline-secondary" onClick={resetUserForm}>Cancel</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="panel resource-list-panel">
                  <h2>Users</h2>
                  <div className="list-table">
                    <div className="list-row header-row user-row">
                      <span>Username</span>
                      <span>Role</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>

                    {(users || []).map((user) => (
                      <div key={user.id} className="list-row user-row">
                        <span>{user.username}</span>
                        <span>{user.role}</span>
                        <span className={`status-badge ${user.status}`}>{user.status}</span>
                        <div className="row-actions">
                          {isAdmin && (
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
                                  setEditingUserId(user.id);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="delete-button small-button"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'supplies' && (
              <section className="resource-panel">
                <div className="panel resource-form-panel">
                  <h2>{editingSupplyId ? 'Edit supply' : 'Add new supply'}</h2>
                  <form className="resource-form row g-3" onSubmit={handleSupplySubmit}>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="name"
                        value={supplyForm.name}
                        onChange={(event) => setSupplyForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Supply name"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        className="form-control"
                        name="quantity"
                        type="number"
                        value={supplyForm.quantity}
                        onChange={(event) => setSupplyForm((current) => ({ ...current, quantity: event.target.value }))}
                        placeholder="Quantity"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        name="unit"
                        value={supplyForm.unit}
                        onChange={(event) => setSupplyForm((current) => ({ ...current, unit: event.target.value }))}
                        required
                      >
                        <option value="pieces">Pieces</option>
                        <option value="boxes">Boxes</option>
                        <option value="liters">Liters</option>
                        <option value="kg">Kilograms</option>
                        <option value="rolls">Rolls</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="reorder_level"
                        type="number"
                        value={supplyForm.reorder_level}
                        onChange={(event) => setSupplyForm((current) => ({ ...current, reorder_level: event.target.value }))}
                        placeholder="Reorder level"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        name="status"
                        value={supplyForm.status}
                        onChange={(event) => setSupplyForm((current) => ({ ...current, status: event.target.value }))}
                      >
                        <option value="active">Active</option>
                        <option value="low_stock">Low stock</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                    <div className="col-12 form-actions d-flex gap-2">
                      <button type="submit" className="primary-button btn btn-primary">{editingSupplyId ? 'Save supply' : 'Create supply'}</button>
                      {editingSupplyId && (
                        <button type="button" className="secondary-button btn btn-outline-secondary" onClick={resetSupplyForm}>Cancel</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="panel resource-list-panel">
                  <h2>Supplies</h2>
                  <div className="filter-row">
                    <input
                      type="text"
                      value={supplySearch}
                      onChange={(event) => setSupplySearch(event.target.value)}
                      placeholder="Search supplies"
                    />
                    <select value={supplyStatusFilter} onChange={(event) => setSupplyStatusFilter(event.target.value)}>
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="low_stock">Low stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                  <div className="list-table">
                    <div className="list-row header-row supply-row">
                      <span>Name</span>
                      <span>Qty</span>
                      <span>Unit</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>

                    {(filteredSupplies || []).map((item) => (
                      <div key={item.id} className="list-row supply-row">
                        <span>{item.name}</span>
                        <span>{item.quantity}</span>
                        <span>{item.unit}</span>
                        <span className={`status-badge ${item.status || 'active'}`}>{item.status || 'active'}</span>
                        <div className="row-actions">
                          {isAdmin && (
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
                                    status: item.status || 'active',
                                  });
                                  setEditingSupplyId(item.id);
                                }}
                              >
                                Edit
                              </button>
                              <button type="button" className="delete-button small-button" onClick={() => handleDeleteSupply(item.id)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'machines' && (
              <section className="resource-panel">
                <div className="panel resource-form-panel">
                  <h2>{editingMachineId ? 'Edit machine' : 'Add new machine'}</h2>
                  <form className="resource-form row g-3" onSubmit={handleMachineSubmit}>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="name"
                        value={machineForm.name}
                        onChange={(event) => setMachineForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Machine name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="serial_number"
                        value={machineForm.serial_number}
                        onChange={(event) => setMachineForm((current) => ({ ...current, serial_number: event.target.value }))}
                        placeholder="Serial number"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="model"
                        value={machineForm.model}
                        onChange={(event) => setMachineForm((current) => ({ ...current, model: event.target.value }))}
                        placeholder="Model"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="location"
                        value={machineForm.location}
                        onChange={(event) => setMachineForm((current) => ({ ...current, location: event.target.value }))}
                        placeholder="Location"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        name="status"
                        value={machineForm.status}
                        onChange={(event) => setMachineForm((current) => ({ ...current, status: event.target.value }))}
                      >
                        <option value="operational">Operational</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                    <div className="col-12 form-actions d-flex gap-2">
                      <button type="submit" className="primary-button btn btn-primary">{editingMachineId ? 'Save machine' : 'Create machine'}</button>
                      {editingMachineId && (
                        <button type="button" className="secondary-button btn btn-outline-secondary" onClick={resetMachineForm}>Cancel</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="panel resource-list-panel">
                  <h2>Machines</h2>
                  <div className="filter-row">
                    <input
                      type="text"
                      value={machineSearch}
                      onChange={(event) => setMachineSearch(event.target.value)}
                      placeholder="Search machines"
                    />
                    <select value={machineStatusFilter} onChange={(event) => setMachineStatusFilter(event.target.value)}>
                      <option value="all">All statuses</option>
                      <option value="operational">Operational</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                  <div className="list-table">
                    <div className="list-row header-row machine-row">
                      <span>Name</span>
                      <span>Model</span>
                      <span>Location</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>

                    {(filteredMachines || []).map((machine) => (
                      <div key={machine.id} className="list-row machine-row">
                        <span>{machine.name}</span>
                        <span>{machine.model}</span>
                        <span>{machine.location}</span>
                        <span className={`status-badge ${machine.status || 'operational'}`}>{machine.status || 'operational'}</span>
                        <div className="row-actions">
                          {isAdmin && (
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
                                  setEditingMachineId(machine.id);
                                }}
                              >
                                Edit
                              </button>
                              <button type="button" className="delete-button small-button" onClick={() => handleDeleteMachine(machine.id)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
