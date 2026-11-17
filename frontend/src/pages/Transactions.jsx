
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Transactions() {
  const { user } = useAuth();
  const isEmployee = user.role === 'EMPLOYEE';

  const [transactions, setTransactions] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    payrollId: '',
    transactionReference: '',
    paymentMethod: 'NEFT',
    amount: '',
    status: 'PENDING',
    remarks: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTransactions();

    if (!isEmployee) {
      fetchPayrolls();
    }
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(
        isEmployee ? '/transactions/my' : '/transactions'
      );

      setTransactions(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load transactions.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll');

      setPayrolls(
        response.data.filter(
          (payroll) => payroll.status !== 'PAID'
        )
      );
    } catch (err) {
      setError('Unable to load payroll records.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'payrollId') {
      const selectedPayroll = payrolls.find(
        (payroll) => String(payroll.id) === value
      );

      setFormData((previous) => ({
        ...previous,
        payrollId: value,
        amount: selectedPayroll
          ? String(selectedPayroll.netSalary)
          : ''
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/transactions', {
        ...formData,
        payrollId: Number(formData.payrollId),
        amount: Number(formData.amount)
      });

      setSuccess('Transaction created successfully.');

      setFormData({
        payrollId: '',
        transactionReference: '',
        paymentMethod: 'NEFT',
        amount: '',
        status: 'PENDING',
        remarks: ''
      });

      await fetchTransactions();
      await fetchPayrolls();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to create transaction.'
      );
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    return {
      total: transactions.length,
      successful: transactions.filter(
        t => t.status === 'SUCCESS'
      ).length,
      pending: transactions.filter(
        t => t.status === 'PENDING'
      ).length,
      failed: transactions.filter(
        t => t.status === 'FAILED'
      ).length,
      totalAmount: transactions
        .filter(t => t.status === 'SUCCESS')
        .reduce(
          (total, t) => total + Number(t.amount || 0),
          0
        )
    };
  }, [transactions]);

  const filteredTransactions = transactions.filter((transaction) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      String(transaction.id).includes(search) ||
      String(transaction.payrollId).includes(search) ||
      (transaction.employeeName || '').toLowerCase().includes(search) ||
      (transaction.transactionReference || '').toLowerCase().includes(search) ||
      (transaction.paymentMethod || '').toLowerCase().includes(search);

    const matchesStatus =
      filterStatus === 'ALL' ||
      transaction.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });

  const getStatusClass = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-success-subtle text-success';
      case 'FAILED':
        return 'bg-danger-subtle text-danger';
      case 'PENDING':
        return 'bg-warning-subtle text-warning-emphasis';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'bi-check-circle-fill';
      case 'FAILED':
        return 'bi-x-circle-fill';
      default:
        return 'bi-clock-fill';
    }
  };

  return (
    <div className="dashboard-content">

      {/* Page Header */}
      <div className="dashboard-welcome mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-arrow-left-right me-2"></i>
            Transactions Management
          </h3>
          <p className="mb-0">
            {isEmployee
              ? 'View your salary payment transactions.'
              : 'Manage salary payments and monitor transaction history.'}
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={fetchTransactions}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success d-flex align-items-center">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="dashboard-stat-label">Total Transactions</div>
                  <div className="dashboard-stat-value">{summary.total}</div>
                  <div className="dashboard-stat-description">
                    All payment records
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-primary-subtle text-primary">
                  <i className="bi bi-receipt"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="dashboard-stat-label">Successful</div>
                  <div className="dashboard-stat-value text-success">
                    {summary.successful}
                  </div>
                  <div className="dashboard-stat-description">
                    Completed payments
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-success-subtle text-success">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="dashboard-stat-label">Pending</div>
                  <div className="dashboard-stat-value text-warning">
                    {summary.pending}
                  </div>
                  <div className="dashboard-stat-description">
                    Awaiting completion
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-warning-subtle text-warning">
                  <i className="bi bi-clock-history"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="dashboard-stat-label">
                    Successful Payment Amount
                  </div>
                  <div className="dashboard-stat-value">
                    {formatAmount(summary.totalAmount)}
                  </div>
                  <div className="dashboard-stat-description">
                    Total successfully paid
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-info-subtle text-info">
                  <i className="bi bi-currency-rupee"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Create Transaction */}
      {!isEmployee && (
        <div className="card dashboard-card mb-4">

          <div className="card-header bg-white py-3">
            <h5 className="fw-bold mb-1">
              <i className="bi bi-plus-circle text-primary me-2"></i>
              Create Transaction
            </h5>
            <small className="text-muted">
              Record a payment for an unpaid payroll.
            </small>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Select Payroll
                  </label>

                  <select
                    name="payrollId"
                    className="form-select"
                    value={formData.payrollId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose payroll</option>

                    {payrolls.map((payroll) => (
                      <option key={payroll.id} value={payroll.id}>
                        Payroll #{payroll.id} - {payroll.employeeName}
                        {' - '}
                        {payroll.payrollMonth}/{payroll.payrollYear}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Transaction Reference
                  </label>

                  <input
                    type="text"
                    name="transactionReference"
                    className="form-control"
                    placeholder="Enter unique transaction reference"
                    value={formData.transactionReference}
                    onChange={handleChange}
                    maxLength="30"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                  >
                    <option value="NEFT">NEFT</option>
                    <option value="IMPS">IMPS</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Amount (₹)
                  </label>

                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    value={formData.amount}
                    readOnly
                    required
                  />

                  <small className="text-muted">
                    Automatically filled using the selected payroll's net salary.
                  </small>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Transaction Status
                  </label>

                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Remarks
                  </label>

                  <input
                    type="text"
                    name="remarks"
                    className="form-control"
                    placeholder="Optional payment remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    maxLength="500"
                  />
                </div>

              </div>

              {formData.payrollId && (
                <div className="alert alert-info mt-3 mb-0">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Transaction amount: <strong>{formatAmount(formData.amount)}</strong>
                </div>
              )}

              <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={saving || payrolls.length === 0}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Create Transaction
                    </>
                  )}
                </button>

                {payrolls.length === 0 && (
                  <span className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    No unpaid payroll records are available.
                  </span>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="card dashboard-card">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-clock-history text-primary me-2"></i>
                Transaction History
              </h5>
              <small className="text-muted">
                View and search payment records.
              </small>
            </div>

            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              {filteredTransactions.length} Records
            </span>
          </div>

          {/* Search and Filter */}
          <div className="row g-3 mb-4">

            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search employee, reference, transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

          </div>

          {/* Transaction Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="text-muted mt-3 mb-0">
                Loading transactions...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt display-4 text-muted"></i>
              <h6 className="fw-bold mt-3">No Transactions Found</h6>
              <p className="text-muted mb-0">
                Transaction records will appear here.
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-4 text-muted"></i>
              <h6 className="fw-bold mt-3">No Matching Transactions</h6>
              <p className="text-muted mb-0">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>Transaction ID</th>
                    {!isEmployee && <th>Employee</th>}
                    <th>Payroll ID</th>
                    <th>Reference</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>

                      <td>
                        <span className="fw-semibold text-primary">
                          #{transaction.id}
                        </span>
                      </td>

                      {!isEmployee && (
                        <td>
                          <div className="fw-semibold">
                            {transaction.employeeName}
                          </div>
                          <small className="text-muted">
                            Employee ID: {transaction.employeeId}
                          </small>
                        </td>
                      )}

                      <td>#{transaction.payrollId}</td>

                      <td>
                        <span className="fw-semibold">
                          {transaction.transactionReference}
                        </span>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {transaction.paymentMethod}
                        </span>
                      </td>

                      <td>
                        <span className="fw-bold">
                          {formatAmount(transaction.amount)}
                        </span>
                      </td>

                      <td>
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusClass(transaction.status)}`}>
                          <i className={`bi ${getStatusIcon(transaction.status)} me-1`}></i>
                          {transaction.status}
                        </span>
                      </td>

                      <td>
                        <small>{formatDate(transaction.transactionDate)}</small>
                      </td>

                      <td>
                        <span className="text-muted">
                          {transaction.remarks || '-'}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

      {/* Information */}
      <div className="alert alert-info mt-4 mb-0">
        <i className="bi bi-info-circle-fill me-2"></i>
        Successful transactions update the associated payroll payment status.
        Verify payment details before recording a transaction.
      </div>

    </div>
  );
}

export default Transactions;
