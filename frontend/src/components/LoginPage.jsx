import { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onSubmit, isSubmitting, error }) {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="login-shell container-fluid p-0 position-relative">
      {isSubmitting && (
        <div className="login-loading-overlay" aria-live="polite" aria-label="Signing in">
          <div className="p-loader-circle">
            <span>P</span>
          </div>
          <p>Signing in...</p>
        </div>
      )}

      <div className="row g-0 min-vh-100 align-items-stretch">
        <div className="col-lg-5 d-flex align-items-center justify-content-center login-panel">
          <div className="login-card card border-0 shadow-lg p-4 p-md-5" style={{ width: '100%', maxWidth: '440px' }}>
            <div className="login-header mb-4">
              <p className="eyebrow text-uppercase fw-semibold mb-2">Polyprime</p>
              <h1 className="display-6 fw-bold mb-0">Welcome back</h1>
            </div>

            <form onSubmit={handleSubmit} className="login-form needs-validation" noValidate>
              <div className="mb-3">
                <label htmlFor="username" className="form-label fw-semibold">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  className="form-control form-control-lg"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="form-control form-control-lg"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

              <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold login-submit-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="submit-content">
                    <span className="mini-spinner" aria-hidden="true" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-7 d-flex align-items-center justify-content-center brand-panel text-white">
          <div className="brand-content text-center px-4 py-5">
            <div className="brand-mark rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4">P</div>
            <h2 className="fw-bold mb-3">Polyprime Inventory Management System</h2>
            <p className="lead mb-0 opacity-75">Track stock, monitor operations, and keep your production moving.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
