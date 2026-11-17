
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Payslips() {
  const { user } = useAuth();

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError('');

      const endpoint =
        user.role === 'EMPLOYEE' ? '/payroll/my' : '/payroll';

      const response = await api.get(endpoint);
      setPayrolls(response.data);
    } catch (err) {
      console.error('Payslip loading failed:', err);
      setError('Unable to load payslip records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = async (payrollId) => {
    try {
      setDownloadingId(payrollId);
      setError('');

      const endpoint =
        user.role === 'EMPLOYEE'
          ? `/payslips/my/${payrollId}`
          : `/payslips/${payrollId}`;

      const response = await api.get(endpoint, {
        responseType: 'blob'
      });

      const pdfBlob = new Blob([response.data], {
        type: 'application/pdf'
      });

      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = `payslip-${payrollId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Payslip download failed:', err);
      setError('Unable to download payslip. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const summary = useMemo(() => {
    return {
      total: payrolls.length,
      paid: payrolls.filter(p => p.status === 'PAID').length,
      pending: payrolls.filter(p => p.status === 'PENDING').length,
      netSalary: payrolls.reduce(
        (total, p) => total + Number(p.netSalary || 0), 0
      )
    };
  }, [payrolls]);

  const filteredPayrolls = payrolls.filter((payroll) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      String(payroll.id).includes(search) ||
      (payroll.employeeName || '').toLowerCase().includes(search) ||
      (months[payroll.payrollMonth - 1] || '').toLowerCase().includes(search) ||
      String(payroll.payrollYear).includes(search);

    const matchesStatus =
      statusFilter === 'ALL' || payroll.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-success-subtle text-success';
      case 'PENDING':
        return 'bg-warning-subtle text-warning-emphasis';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  };

  return (
    <div className="dashboard-content">

      {/* Page Header */}
      <div className="dashboard-welcome mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Payslip Management
          </h3>
          <p className="mb-0">
            View salary statements and download professional PDF payslips.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={fetchPayslips}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="dashboard-stat-label">Total Payslips</div>
                  <div className="dashboard-stat-value">{summary.total}</div>
                  <div className="dashboard-stat-description">
                    Available salary records
                  </div>
                </div>
                <div className="dashboard-stat-icon bg-primary-subtle text-primary">
                  <i className="bi bi-file-earmark-text"></i>
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
                  <div className="dashboard-stat-label">Paid</div>
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
                    Awaiting payment
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
                  <div className="dashboard-stat-label">Total Net Salary</div>
                  <div className="dashboard-stat-value">
                    {formatCurrency(summary.netSalary)}
                  </div>
                  <div className="dashboard-stat-description">
                    Combined net salary
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

      {/* Payslip History */}
      <div className="card dashboard-card">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-receipt me-2 text-primary"></i>
                {user.role === 'EMPLOYEE'
                  ? 'My Payslips'
                  : 'Employee Payslip History'}
              </h5>
              <small className="text-muted">
                View payroll details and download salary statements.
              </small>
            </div>

            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              {filteredPayrolls.length} Records
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
                  placeholder="Search by employee, payroll ID, month or year..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted mt-3 mb-0">
                Loading payslip records...
              </p>
            </div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-file-earmark-x display-4 text-muted"></i>
              <h6 className="mt-3 fw-bold">No Payslips Found</h6>
              <p className="text-muted mb-0">
                Payslip records will appear here once payroll is generated.
              </p>
            </div>
          ) : filteredPayrolls.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-4 text-muted"></i>
              <h6 className="mt-3 fw-bold">No Matching Records</h6>
              <p className="text-muted mb-0">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>Payroll ID</th>
                    {user.role !== 'EMPLOYEE' && <th>Employee</th>}
                    <th>Payroll Period</th>
                    <th>Basic Salary</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayrolls.map((payroll) => (
                    <tr key={payroll.id}>
                      <td>
                        <span className="fw-semibold text-primary">
                          #{payroll.id}
                        </span>
                      </td>

                      {user.role !== 'EMPLOYEE' && (
                        <td>
                          <div className="fw-semibold">
                            {payroll.employeeName}
                          </div>
                        </td>
                      )}

                      <td>
                        <div className="fw-semibold">
                          {months[payroll.payrollMonth - 1] || 'Unknown'}
                        </div>
                        <small className="text-muted">
                          {payroll.payrollYear}
                        </small>
                      </td>

                      <td>{formatCurrency(payroll.basicSalary)}</td>

                      <td>{formatCurrency(payroll.grossSalary)}</td>

                      <td className="text-danger">
                        {formatCurrency(payroll.totalDeductions)}
                      </td>

                      <td>
                        <span className="fw-bold text-success">
                          {formatCurrency(payroll.netSalary)}
                        </span>
                      </td>

                      <td>
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusClass(payroll.status)}`}>
                          <i className={`bi ${payroll.status === 'PAID' ? 'bi-check-circle-fill' : 'bi-clock-fill'} me-1`}></i>
                          {payroll.status}
                        </span>
                      </td>

                      <td>{formatDate(payroll.paymentDate)}</td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary text-nowrap"
                          onClick={() => downloadPayslip(payroll.id)}
                          disabled={downloadingId !== null}
                        >
                          {downloadingId === payroll.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Downloading
                            </>
                          ) : (
                            <>
                              <i className="bi bi-file-earmark-pdf me-1"></i>
                              Download PDF
                            </>
                          )}
                        </button>
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
        Downloaded payslips are provided in PDF format. Keep a copy of your
        salary statements for your records.
      </div>

    </div>
  );
}

export default Payslips;
