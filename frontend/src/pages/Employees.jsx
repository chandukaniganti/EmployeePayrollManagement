
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    basicSalary: '',
    username: '',
    password: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Unable to load employees. Please check your login.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (employee) => {
    setFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || '',
      designation: employee.designation || '',
      dateOfJoining: employee.dateOfJoining || '',
      basicSalary: employee.basicSalary ?? '',
      username: '',
      password: ''
    });

    setEditingId(employee.id);
    setShowForm(true);
    setError('');
    setSuccess('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this employee?'
    );

    if (!confirmDelete) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(`/employees/${id}`);

      setSuccess('Employee deleted successfully!');
      await fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(
        err.response?.data?.message || 'Unable to delete employee.'
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        dateOfJoining: formData.dateOfJoining || null,
        basicSalary: Number(formData.basicSalary)
      };

      if (editingId !== null) {
        await api.put(`/employees/${editingId}`, employeeData);
        setSuccess('Employee updated successfully!');
      } else {
        const accountData = {
          employee: employeeData,
          username: formData.username.trim(),
          password: formData.password
        };

        await api.post(
          '/employees/create-with-account',
          accountData
        );

        setSuccess(
          'Employee and login account created successfully!'
        );
      }

      resetForm();
      await fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to save employee. Please check the details.'
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return employees;

    return employees.filter((employee) => {
      const searchableText = [
        employee.id,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.phone,
        employee.department,
        employee.designation
      ].join(' ').toLowerCase();

      return searchableText.includes(search);
    });
  }, [employees, searchTerm]);

  const totalSalary = employees.reduce(
    (total, employee) => total + Number(employee.basicSalary || 0),
    0
  );

  const departments = new Set(
    employees
      .map((employee) => employee.department)
      .filter(Boolean)
  ).size;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);

  if (loading) {
    return (
      <div className="dashboard-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      {/* Page Heading */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Employee Management</h3>
          <p className="text-muted mb-0">
            Manage employee information and salary details.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary px-4"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setFormData(initialFormData);
              setEditingId(null);
              setShowForm(true);
              setError('');
              setSuccess('');
            }
          }}
        >
          <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-person-plus-fill'} me-2`}></i>
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess('')}
          ></button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="dashboard-stat-label">Total Employees</p>
                  <h3 className="dashboard-stat-value mb-0">
                    {employees.length}
                  </h3>
                  <small className="text-muted">Registered employees</small>
                </div>
                <div className="dashboard-stat-icon" style={{
                  color: '#4361ee',
                  backgroundColor: '#eef1ff'
                }}>
                  <i className="bi bi-people-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="dashboard-stat-label">Departments</p>
                  <h3 className="dashboard-stat-value mb-0">
                    {departments}
                  </h3>
                  <small className="text-muted">Active departments represented</small>
                </div>
                <div className="dashboard-stat-icon" style={{
                  color: '#16a36a',
                  backgroundColor: '#e8f8f0'
                }}>
                  <i className="bi bi-building"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="dashboard-stat-label">Total Basic Salary</p>
                  <h3 className="dashboard-stat-value mb-0">
                    {formatCurrency(totalSalary)}
                  </h3>
                  <small className="text-muted">Combined monthly basic salary</small>
                </div>
                <div className="dashboard-stat-icon" style={{
                  color: '#7952b3',
                  backgroundColor: '#f2ebff'
                }}>
                  <i className="bi bi-wallet2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add / Edit Employee Form */}
      {showForm && (
        <div className="card dashboard-info-card mb-4">
          <div className="card-body p-4">

            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="dashboard-info-icon">
                <i className="bi bi-person-vcard"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1">
                  {editingId !== null ? 'Edit Employee' : 'Add New Employee'}
                </h5>
                <small className="text-muted">
                  Enter the employee information below.
                </small>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label fw-semibold">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    placeholder="e.g. IT, HR, Finance"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    className="form-control"
                    placeholder="Enter job designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Date of Joining</label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    className="form-control"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Basic Salary (₹) *</label>
                  <input
                    type="number"
                    name="basicSalary"
                    className="form-control"
                    placeholder="Enter basic salary"
                    value={formData.basicSalary}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Login Account Fields - Only for New Employees */}
                {editingId === null && (
                  <>
                    <div className="col-12 mt-4">
                      <hr />
                      <h6 className="fw-bold mb-1">
                        <i className="bi bi-shield-lock me-2"></i>
                        Employee Login Account
                      </h6>
                      <small className="text-muted">
                        Create login credentials for this employee.
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Login Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        className="form-control"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleChange}
                        minLength="3"
                        maxLength="100"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Login Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Create a temporary password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength="8"
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <div className="alert alert-info mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        The employee account will automatically receive the
                        EMPLOYEE role. The password will be securely encrypted
                        before it is stored.
                      </div>
                    </div>
                  </>
                )}

              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-success px-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {editingId !== null ? 'Update Employee' : 'Create Employee & Login'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee List */}
      <div className="card dashboard-info-card">
        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h5 className="fw-bold mb-1">Employee Directory</h5>
              <small className="text-muted">
                {filteredEmployees.length} employee(s) displayed
              </small>
            </div>

            <div className="input-group" style={{ maxWidth: '350px' }}>
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Basic Salary</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="fw-semibold">#{employee.id}</td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor: '#eef1ff',
                            color: '#4361ee',
                            flexShrink: 0
                          }}
                        >
                          {(employee.firstName || 'E').charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-semibold">
                          {employee.firstName} {employee.lastName}
                        </span>
                      </div>
                    </td>

                    <td>{employee.email}</td>
                    <td>{employee.phone || '-'}</td>
                    <td>{employee.department || '-'}</td>
                    <td>{employee.designation || '-'}</td>

                    <td className="fw-semibold text-success">
                      {formatCurrency(Number(employee.basicSalary || 0))}
                    </td>

                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(employee)}
                        title="Edit employee"
                      >
                        <i className="bi bi-pencil-square"></i>
                        <span className="ms-1">Edit</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(employee.id)}
                        title="Delete employee"
                      >
                        <i className="bi bi-trash"></i>
                        <span className="ms-1">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <i className="bi bi-people text-muted fs-1 d-block mb-2"></i>
                      <span className="text-muted">
                        {searchTerm
                          ? 'No employees match your search.'
                          : 'No employees found. Add your first employee.'}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Employees;
