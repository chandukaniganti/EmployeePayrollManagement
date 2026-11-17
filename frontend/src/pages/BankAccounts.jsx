
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function BankAccounts() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [bankAccount, setBankAccount] = useState(null);

  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: 'SAVINGS'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEmployee = user.role === 'EMPLOYEE';

  useEffect(() => {
    if (isEmployee) {
      fetchMyBankAccount();
    } else {
      fetchEmployees();
    }
  }, []);

  const fetchMyBankAccount = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/bank-accounts/my');
      setBankAccount(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setBankAccount(null);
      } else {
        setError(
          err.response?.data?.message ||
          'Unable to load bank account details.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      setError('Unable to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeBankAccount = async () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setBankAccount(null);

    try {
      const response = await api.get(
        `/bank-accounts/employee/${selectedEmployeeId}`
      );

      setBankAccount(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No bank account registered for this employee.');
      } else {
        setError(
          err.response?.data?.message ||
          'Unable to fetch bank account.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === 'ifscCode' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/bank-accounts/my', formData);

      setSuccess('Bank account registered successfully.');

      setFormData({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountType: 'SAVINGS'
      });

      await fetchMyBankAccount();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to register bank account.'
      );
    } finally {
      setSaving(false);
    }
  };

  const accountSummary = useMemo(() => ({
    registered: bankAccount ? 1 : 0,
    accountType: bankAccount?.accountType || '-',
    bankName: bankAccount?.bankName || 'Not registered'
  }), [bankAccount]);

  if (loading && isEmployee && bankAccount === null) {
    return (
      <div className="dashboard-content text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-muted mt-3">Loading bank account details...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      {/* Page Header */}
      <div className="dashboard-welcome mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-bank me-2"></i>
            Bank Account Management
          </h3>
          <p className="mb-0">
            {isEmployee
              ? 'Register and securely view your salary bank account.'
              : 'View employee banking information securely.'}
          </p>
        </div>

        {isEmployee && (
          <button
            className="btn btn-outline-primary"
            onClick={fetchMyBankAccount}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        )}
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

        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="dashboard-stat-label">
                    Account Registration
                  </div>
                  <div className="dashboard-stat-value">
                    {isEmployee
                      ? accountSummary.registered ? 'Active' : 'Pending'
                      : 'Secure'}
                  </div>
                  <div className="dashboard-stat-description">
                    {isEmployee
                      ? 'Your bank account status'
                      : 'Employee account access'}
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-primary-subtle text-primary">
                  <i className="bi bi-credit-card"></i>
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
                  <div className="dashboard-stat-label">Account Type</div>
                  <div className="dashboard-stat-value">
                    {isEmployee ? accountSummary.accountType : 'Protected'}
                  </div>
                  <div className="dashboard-stat-description">
                    Registered banking category
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-success-subtle text-success">
                  <i className="bi bi-wallet2"></i>
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
                  <div className="dashboard-stat-label">Bank Name</div>
                  <div className="dashboard-stat-value">
                    {isEmployee ? accountSummary.bankName : 'Employee Banks'}
                  </div>
                  <div className="dashboard-stat-description">
                    Banking information
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-info-subtle text-info">
                  <i className="bi bi-building"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Admin Employee Selection */}
      {!isEmployee && (
        <div className="card dashboard-card mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-person-lines-fill text-primary me-2"></i>
              Find Employee Bank Account
            </h5>

            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-9">
                <label className="form-label fw-semibold">
                  Select Employee
                </label>

                <select
                  className="form-select"
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setBankAccount(null);
                    setError('');
                    setSuccess('');
                  }}
                >
                  <option value="">Choose employee</option>

                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.id} - {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={fetchEmployeeBankAccount}
                  disabled={loading || !selectedEmployeeId}
                >
                  <i className="bi bi-search me-2"></i>
                  View Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !isEmployee && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary"></div>
          <p className="text-muted mt-2">Loading account information...</p>
        </div>
      )}

      {/* Registered Bank Account */}
      {bankAccount && !loading && (
        <div className="card dashboard-card mb-4">

          <div className="card-header bg-white py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-credit-card-2-front text-primary me-2"></i>
                Registered Bank Account
              </h5>

              <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">
                <i className="bi bi-shield-check me-1"></i>
                Registered
              </span>
            </div>
          </div>

          <div className="card-body">

            {/* Bank Card */}
            <div
              className="p-4 rounded-3 text-white mb-4"
              style={{
                background: 'linear-gradient(120deg, #172554, #2563eb)',
                maxWidth: '650px'
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-white-50">BANK NAME</small>
                  <h5 className="fw-bold mt-1 mb-0">
                    {bankAccount.bankName}
                  </h5>
                </div>
                <i className="bi bi-bank fs-2"></i>
              </div>

              <div className="mt-4">
                <small className="text-white-50">ACCOUNT NUMBER</small>
                <h4 className="fw-semibold mt-1 mb-3">
                  {bankAccount.maskedAccountNumber}
                </h4>
                <div className="d-flex justify-content-between flex-wrap gap-3">
                  <div>
                    <small className="text-white-50">ACCOUNT HOLDER</small>
                    <div className="fw-semibold">
                      {bankAccount.accountHolderName}
                    </div>
                  </div>
                  <div>
                    <small className="text-white-50">ACCOUNT TYPE</small>
                    <div className="fw-semibold">
                      {bankAccount.accountType}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <h6 className="fw-bold mb-3">Account Information</h6>

            <div className="row g-3">

              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 h-100">
                  <small className="text-muted">Employee ID</small>
                  <div className="fw-semibold mt-1">
                    #{bankAccount.employeeId}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 h-100">
                  <small className="text-muted">Account Holder Name</small>
                  <div className="fw-semibold mt-1">
                    {bankAccount.accountHolderName}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 h-100">
                  <small className="text-muted">IFSC Code</small>
                  <div className="fw-semibold mt-1">
                    {bankAccount.ifscCode}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 h-100">
                  <small className="text-muted">Branch Name</small>
                  <div className="fw-semibold mt-1">
                    {bankAccount.branchName}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 h-100">
                  <small className="text-muted">Bank Name</small>
                  <div className="fw-semibold mt-1">
                    {bankAccount.bankName}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 h-100">
                  <small className="text-muted">Account Type</small>
                  <div className="fw-semibold mt-1">
                    {bankAccount.accountType}
                  </div>
                </div>
              </div>

            </div>

            <div className="alert alert-info mt-4 mb-0">
              <i className="bi bi-shield-lock-fill me-2"></i>
              Your bank account number is masked for security. Only protected
              account information is displayed.
            </div>
          </div>
        </div>
      )}

      {/* Employee Registration Form */}
      {isEmployee && !bankAccount && !loading && (
        <div className="card dashboard-card">

          <div className="card-header bg-white py-3">
            <h5 className="fw-bold mb-1">
              <i className="bi bi-plus-circle text-primary me-2"></i>
              Register Salary Bank Account
            </h5>
            <small className="text-muted">
              Enter your bank details to receive your salary.
            </small>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    className="form-control"
                    placeholder="Enter account holder name"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Account Number
                  </label>
                  <input
                    type="password"
                    name="accountNumber"
                    className="form-control"
                    placeholder="Enter 9 to 18 digit account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    minLength="9"
                    maxLength="18"
                    pattern="[0-9]{9,18}"
                    title="Enter 9 to 18 digits"
                    autoComplete="off"
                    required
                  />
                  <small className="text-muted">
                    Your account number is not displayed after registration.
                  </small>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    className="form-control text-uppercase"
                    placeholder="Example: SBIN0001234"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    maxLength="11"
                    pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}"
                    title="Enter a valid 11-character IFSC code"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    className="form-control"
                    placeholder="Enter bank name"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    className="form-control"
                    placeholder="Enter branch name"
                    value={formData.branchName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Account Type
                  </label>
                  <select
                    name="accountType"
                    className="form-select"
                    value={formData.accountType}
                    onChange={handleChange}
                    required
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                    <option value="SALARY">Salary Account</option>
                  </select>
                </div>

              </div>

              <div className="alert alert-warning mt-4">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                Please verify your bank details carefully before submitting.
                Your account number will be securely masked in the application.
              </div>

              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check me-2"></i>
                    Register Bank Account
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default BankAccounts;
