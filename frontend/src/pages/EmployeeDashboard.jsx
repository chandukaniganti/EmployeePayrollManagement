
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function EmployeeDashboard({ setActivePage }) {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        api.get('/attendance/my'),
        api.get('/leaves/my'),
        api.get('/payroll/my'),
        api.get('/transactions/my')
      ]);

      const [attendanceResult, leavesResult, payrollResult, transactionResult] = results;

      if (attendanceResult.status === 'fulfilled') {
        setAttendance(attendanceResult.value.data || []);
      }

      if (leavesResult.status === 'fulfilled') {
        setLeaves(leavesResult.value.data || []);
      }

      if (payrollResult.status === 'fulfilled') {
        setPayrolls(payrollResult.value.data || []);
      }

      if (transactionResult.status === 'fulfilled') {
        setTransactions(transactionResult.value.data || []);
      }

      if (results.every((result) => result.status === 'rejected')) {
        setError('Unable to load dashboard information. Please try again.');
      }
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Unable to load dashboard information.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-CA');

  const todayAttendance = attendance.find(
    (record) => record.attendanceDate === today
  );

  const approvedLeaves = leaves.filter(
    (leave) => leave.status === 'APPROVED'
  ).length;

  const pendingLeaves = leaves.filter(
    (leave) => leave.status === 'PENDING'
  ).length;

  const latestPayroll = [...payrolls].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

  const latestTransaction = [...transactions].sort(
    (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
  )[0];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'SUCCESS':
      case 'PAID':
      case 'PRESENT':
        return 'bg-success-subtle text-success';

      case 'PENDING':
      case 'HALF_DAY':
        return 'bg-warning-subtle text-warning-emphasis';

      case 'REJECTED':
      case 'FAILED':
      case 'ABSENT':
        return 'bg-danger-subtle text-danger';

      default:
        return 'bg-secondary-subtle text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-3">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      <div className="dashboard-welcome mb-4">
        <div>
          <h3>Welcome back, {user.username}!</h3>
          <p>Here is your personal employee overview.</p>
        </div>

        <div className="dashboard-date">
          <i className="bi bi-calendar3 me-2" />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error}
          <button
            className="btn btn-sm btn-outline-dark ms-3"
            onClick={fetchDashboardData}
          >
            Retry
          </button>
        </div>
      )}

      <div className="row g-4 mb-4">

        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="dashboard-stat-label">Attendance Today</div>
                  <div className="dashboard-stat-value">
                    {todayAttendance?.status || 'Not Marked'}
                  </div>
                  <div className="dashboard-stat-description">
                    Your daily attendance
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-primary-subtle text-primary">
                  <i className="bi bi-calendar-check" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="dashboard-stat-label">Total Leave Requests</div>
                  <div className="dashboard-stat-value">{leaves.length}</div>
                  <div className="dashboard-stat-description">
                    {approvedLeaves} approved · {pendingLeaves} pending
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-warning-subtle text-warning">
                  <i className="bi bi-calendar2-minus" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="dashboard-stat-label">Latest Net Salary</div>
                  <div className="dashboard-stat-value">
                    {latestPayroll
                      ? formatCurrency(latestPayroll.netSalary)
                      : '—'}
                  </div>
                  <div className="dashboard-stat-description">
                    {latestPayroll
                      ? `${latestPayroll.payrollMonth} ${latestPayroll.payrollYear}`
                      : 'No payroll available'}
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-success-subtle text-success">
                  <i className="bi bi-wallet2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="dashboard-stat-label">Transactions</div>
                  <div className="dashboard-stat-value">
                    {transactions.length}
                  </div>
                  <div className="dashboard-stat-description">
                    Your payment records
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-info-subtle text-info">
                  <i className="bi bi-credit-card" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="row g-4">

        <div className="col-lg-7">
          <div className="card dashboard-info-card h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Today's Attendance</h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setActivePage('My Attendance')}
                >
                  View Attendance
                </button>
              </div>

              <div className="row g-3">
                <div className="col-sm-4">
                  <div className="p-3 bg-light rounded-3">
                    <small className="text-muted">Check In</small>
                    <h5 className="mt-2 mb-0">
                      {todayAttendance?.checkIn || '--:--'}
                    </h5>
                  </div>
                </div>

                <div className="col-sm-4">
                  <div className="p-3 bg-light rounded-3">
                    <small className="text-muted">Check Out</small>
                    <h5 className="mt-2 mb-0">
                      {todayAttendance?.checkOut || '--:--'}
                    </h5>
                  </div>
                </div>

                <div className="col-sm-4">
                  <div className="p-3 bg-light rounded-3">
                    <small className="text-muted">Working Hours</small>
                    <h5 className="mt-2 mb-0">
                      {todayAttendance?.totalHours != null
                        ? `${todayAttendance.totalHours} hrs`
                        : '0 hrs'}
                    </h5>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-muted me-2">Attendance Status:</span>
                <span className={`badge ${getStatusClass(todayAttendance?.status)}`}>
                  {todayAttendance?.status || 'NOT MARKED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card dashboard-info-card h-100">
            <div className="card-body p-4">
              <h5 className="mb-4">Quick Actions</h5>

              <div className="d-grid gap-3">

                <button
                  className="btn btn-light text-start p-3"
                  onClick={() => setActivePage('My Attendance')}
                >
                  <i className="bi bi-calendar-check text-primary me-3" />
                  My Attendance
                  <i className="bi bi-arrow-right float-end" />
                </button>

                <button
                  className="btn btn-light text-start p-3"
                  onClick={() => setActivePage('My Leaves')}
                >
                  <i className="bi bi-calendar2-plus text-warning me-3" />
                  Apply for Leave
                  <i className="bi bi-arrow-right float-end" />
                </button>

                <button
                  className="btn btn-light text-start p-3"
                  onClick={() => setActivePage('My Payslips')}
                >
                  <i className="bi bi-file-earmark-pdf text-danger me-3" />
                  View My Payslips
                  <i className="bi bi-arrow-right float-end" />
                </button>

                <button
                  className="btn btn-light text-start p-3"
                  onClick={() => setActivePage('My Bank Account')}
                >
                  <i className="bi bi-bank text-success me-3" />
                  My Bank Account
                  <i className="bi bi-arrow-right float-end" />
                </button>

              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card dashboard-info-card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Recent Payment</h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setActivePage('My Transactions')}
                >
                  View All
                </button>
              </div>

              {latestTransaction ? (
                <div className="row align-items-center g-3">
                  <div className="col-md-3">
                    <small className="text-muted">Reference</small>
                    <div className="fw-semibold">
                      {latestTransaction.transactionReference}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <small className="text-muted">Amount</small>
                    <div className="fw-semibold">
                      {formatCurrency(latestTransaction.amount)}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <small className="text-muted">Payment Method</small>
                    <div className="fw-semibold">
                      {latestTransaction.paymentMethod}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <small className="text-muted">Status</small>
                    <div>
                      <span className={`badge ${getStatusClass(latestTransaction.status)}`}>
                        {latestTransaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No payment transactions available yet.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default EmployeeDashboard;
