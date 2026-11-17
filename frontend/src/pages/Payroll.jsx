
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    employeeId: '',
    payrollMonth: new Date().getMonth() + 1,
    payrollYear: new Date().getFullYear(),
    hra: 0,
    da: 0,
    otherAllowances: 0,
    pf: 0,
    esi: 0,
    otherDeductions: 0
  });

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, []);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Employee loading failed:', err);
      setError('Unable to load employees.');
    }
  };

  // Fetch payroll records
  const fetchPayrolls = async () => {
    try {
      setLoading(true);

      const response = await api.get('/payroll');
      setPayrolls(response.data);
    } catch (err) {
      console.error('Payroll loading failed:', err);
      setError('Unable to load payroll records.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Selected employee
  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === String(form.employeeId)
  );

  const basicSalary = Number(selectedEmployee?.basicSalary || 0);

  // Salary calculations
  const grossSalary =
    basicSalary +
    Number(form.hra) +
    Number(form.da) +
    Number(form.otherAllowances);

  const totalDeductions =
    Number(form.pf) +
    Number(form.esi) +
    Number(form.otherDeductions);

  const netSalary = grossSalary - totalDeductions;

  // Currency formatter
  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });

  // Payroll summary
  const summary = useMemo(() => ({
    total: payrolls.length,
    paid: payrolls.filter(
      (payroll) => payroll.status === 'PAID'
    ).length,
    pending: payrolls.filter(
      (payroll) => payroll.status !== 'PAID'
    ).length,
    netTotal: payrolls.reduce(
      (total, payroll) => total + Number(payroll.netSalary || 0),
      0
    )
  }), [payrolls]);

  // Generate payroll
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!form.employeeId) {
      setError('Please select an employee.');
      return;
    }

    if (netSalary < 0) {
      setError('Total deductions cannot exceed gross salary.');
      return;
    }

    try {
      setSaving(true);

      const request = {
        employeeId: Number(form.employeeId),
        payrollMonth: Number(form.payrollMonth),
        payrollYear: Number(form.payrollYear),
        hra: Number(form.hra),
        da: Number(form.da),
        otherAllowances: Number(form.otherAllowances),
        pf: Number(form.pf),
        esi: Number(form.esi),
        otherDeductions: Number(form.otherDeductions)
      };

      await api.post('/payroll/generate', request);

      setForm((previous) => ({
        ...previous,
        employeeId: '',
        hra: 0,
        da: 0,
        otherAllowances: 0,
        pf: 0,
        esi: 0,
        otherDeductions: 0
      }));

      await fetchPayrolls();

      setSuccess('Payroll generated successfully!');

    } catch (err) {
      console.error('Payroll generation failed:', err);

      setError(
        err.response?.data?.message ||
        'Payroll generation failed. Please check the details and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Status styling
  const getStatusBadge = (status) => {
    return status === 'PAID'
      ? 'bg-success'
      : 'bg-warning text-dark';
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';

    const parts = date.split('-');

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="dashboard-content">

      {/* Page Header */}
      <div className="dashboard-welcome mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            Payroll & Salary Management
          </h3>
          <p className="mb-0">
            Generate monthly payroll and manage employee salary records.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={fetchPayrolls}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Payroll
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-circle me-2"></i>
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
          <i className="bi bi-check-circle me-2"></i>
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

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Total Payrolls</div>
                <div className="dashboard-stat-value">
                  {summary.total}
                </div>
                <div className="dashboard-stat-description">
                  Generated payroll records
                </div>
              </div>
              <div className="dashboard-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-wallet2"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Paid Payrolls</div>
                <div className="dashboard-stat-value text-success">
                  {summary.paid}
                </div>
                <div className="dashboard-stat-description">
                  Successfully paid
                </div>
              </div>
              <div className="dashboard-stat-icon bg-success-subtle text-success">
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Pending Payrolls</div>
                <div className="dashboard-stat-value text-warning">
                  {summary.pending}
                </div>
                <div className="dashboard-stat-description">
                  Awaiting payment
                </div>
              </div>
              <div className="dashboard-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Total Net Salary</div>
                <div className="dashboard-stat-value text-primary">
                  {formatCurrency(summary.netTotal)}
                </div>
                <div className="dashboard-stat-description">
                  Combined payroll amount
                </div>
              </div>
              <div className="dashboard-stat-icon bg-info-subtle text-info">
                <i className="bi bi-currency-rupee"></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Generate Payroll Form */}
      <div className="card dashboard-info-card mb-4">
        <div className="card-body p-4">

          <div className="d-flex align-items-center mb-4">
            <div className="dashboard-info-icon me-3">
              <i className="bi bi-file-earmark-plus"></i>
            </div>
            <div>
              <h5 className="fw-bold mb-1">
                Generate Monthly Payroll
              </h5>
              <p className="text-muted small mb-0">
                Select an employee and enter monthly salary components.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Employee and Period */}
            <h6 className="fw-bold text-primary mb-3">
              <i className="bi bi-person-badge me-2"></i>
              Employee & Payroll Period
            </h6>

            <div className="row g-3 mb-4">

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Select Employee
                </label>

                <select
                  className="form-select"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose Employee</option>

                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.id} - {employee.employeeName || employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Payroll Month
                </label>

                <select
                  className="form-select"
                  name="payrollMonth"
                  value={form.payrollMonth}
                  onChange={handleChange}
                  required
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Payroll Year
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="payrollYear"
                  min="2000"
                  max="2100"
                  value={form.payrollYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-12">
                <label className="form-label fw-semibold">
                  Basic Salary
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-currency-rupee"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light fw-semibold"
                    value={formatCurrency(basicSalary)}
                    readOnly
                  />
                </div>
              </div>

            </div>

            <hr />

            {/* Allowances */}
            <div className="d-flex align-items-center mb-3">
              <div className="dashboard-info-icon me-3">
                <i className="bi bi-plus-circle text-success"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-success">
                  Salary Allowances
                </h6>
                <small className="text-muted">
                  Additional salary components
                </small>
              </div>
            </div>

            <div className="row g-3 mb-4">

              {[
                ['hra', 'House Rent Allowance (HRA)'],
                ['da', 'Dearness Allowance (DA)'],
                ['otherAllowances', 'Other Allowances']
              ].map(([name, label]) => (
                <div className="col-md-4" key={name}>
                  <label className="form-label fw-semibold">
                    {label}
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name={name}
                    min="0"
                    step="0.01"
                    value={form[name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

            </div>

            <hr />

            {/* Deductions */}
            <div className="d-flex align-items-center mb-3">
              <div className="dashboard-info-icon me-3">
                <i className="bi bi-dash-circle text-danger"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-danger">
                  Salary Deductions
                </h6>
                <small className="text-muted">
                  Deductions from employee salary
                </small>
              </div>
            </div>

            <div className="row g-3 mb-4">

              {[
                ['pf', 'Provident Fund (PF)'],
                ['esi', 'Employee State Insurance (ESI)'],
                ['otherDeductions', 'Other Deductions']
              ].map(([name, label]) => (
                <div className="col-md-4" key={name}>
                  <label className="form-label fw-semibold">
                    {label}
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name={name}
                    min="0"
                    step="0.01"
                    value={form[name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

            </div>

            <hr />

            {/* Salary Preview */}
            <div className="card border-0 bg-light mt-4">
              <div className="card-body p-4">

                <h6 className="fw-bold mb-4">
                  <i className="bi bi-calculator me-2 text-primary"></i>
                  Salary Calculation Preview
                </h6>

                <div className="row g-3">

                  <div className="col-md-3">
                    <div className="p-3 bg-white rounded h-100">
                      <small className="text-muted">
                        Basic Salary
                      </small>
                      <h5 className="fw-bold mt-2 mb-0">
                        {formatCurrency(basicSalary)}
                      </h5>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="p-3 bg-white rounded h-100">
                      <small className="text-muted">
                        Gross Salary
                      </small>
                      <h5 className="fw-bold text-primary mt-2 mb-0">
                        {formatCurrency(grossSalary)}
                      </h5>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="p-3 bg-white rounded h-100">
                      <small className="text-muted">
                        Total Deductions
                      </small>
                      <h5 className="fw-bold text-danger mt-2 mb-0">
                        {formatCurrency(totalDeductions)}
                      </h5>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="p-3 bg-white rounded h-100 border border-success">
                      <small className="text-muted">
                        Net Salary
                      </small>
                      <h5 className="fw-bold text-success mt-2 mb-0">
                        {formatCurrency(netSalary)}
                      </h5>
                    </div>
                  </div>

                </div>

                {netSalary < 0 && (
                  <div className="alert alert-danger mt-3 mb-0">
                    Deductions cannot exceed gross salary.
                  </div>
                )}

              </div>
            </div>

            {/* Submit */}
            <div className="d-flex justify-content-end mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving || !selectedEmployee || netSalary < 0}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Generating Payroll...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-check me-2"></i>
                    Generate Payroll
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Payroll History */}
      <div className="card dashboard-info-card">
        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-clock-history me-2 text-primary"></i>
                Payroll History
              </h5>
              <p className="text-muted small mb-0">
                View generated salary records and payment details.
              </p>
            </div>

            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              {payrolls.length} Records
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3"></div>
              <p className="text-muted mb-0">
                Loading payroll records...
              </p>
            </div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-wallet text-muted fs-2"></i>
              <p className="fw-semibold mt-2 mb-1">
                No payroll records found
              </p>
              <p className="text-muted small mb-0">
                Generate a payroll to see records here.
              </p>
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Payroll Period</th>
                    <th>Basic Salary</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>

                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id}>

                      <td className="fw-semibold text-muted">
                        #{payroll.id}
                      </td>

                      <td className="fw-semibold">
                        {payroll.employeeName || '-'}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {months[payroll.payrollMonth - 1]} {payroll.payrollYear}
                        </span>
                      </td>

                      <td>
                        {formatCurrency(payroll.basicSalary)}
                      </td>

                      <td className="fw-semibold">
                        {formatCurrency(payroll.grossSalary)}
                      </td>

                      <td className="text-danger">
                        {formatCurrency(payroll.totalDeductions)}
                      </td>

                      <td className="fw-bold text-success">
                        {formatCurrency(payroll.netSalary)}
                      </td>

                      <td>
                        <span className={`badge ${getStatusBadge(payroll.status)} px-3 py-2`}>
                          {payroll.status || 'PENDING'}
                        </span>
                      </td>

                      <td>
                        {formatDate(payroll.paymentDate)}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default Payroll;
