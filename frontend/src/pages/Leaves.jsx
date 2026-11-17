
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewRemarks, setReviewRemarks] = useState('');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLeaves('ALL');
  }, []);

  // Fetch leave applications
  const fetchLeaves = async (status = selectedStatus) => {
    try {
      setLoading(true);
      setError('');

      let response;

      if (status === 'ALL') {
        response = await api.get('/leaves');
      } else {
        response = await api.get('/leaves/status', {
          params: { status }
        });
      }

      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      setError('Unable to load leave applications.');
    } finally {
      setLoading(false);
    }
  };

  // Filter by status
  const filterByStatus = (status) => {
    setSelectedStatus(status);
    setSuccess('');
    setError('');
    fetchLeaves(status);
  };

  // Open review form
  const openReview = (leave, status) => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setReviewRemarks('');
    setError('');
    setSuccess('');
  };

  // Approve or reject leave
  const handleReview = async (event) => {
    event.preventDefault();

    if (!selectedLeave) return;

    if (
      reviewStatus === 'REJECTED' &&
      !reviewRemarks.trim()
    ) {
      setError('Remarks are required when rejecting leave.');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      await api.post(
        `/leaves/${selectedLeave.id}/review`,
        {
          status: reviewStatus,
          reviewRemarks: reviewRemarks.trim()
        }
      );

      const message = `Leave application ${reviewStatus.toLowerCase()} successfully.`;

      setSelectedLeave(null);
      setReviewRemarks('');

      // Refresh records without clearing the success message
      await fetchLeaves(selectedStatus);
      setSuccess(message);

    } catch (error) {
      console.error('Leave review failed:', error);

      setError(
        error.response?.data?.message ||
        'Unable to review leave application.'
      );
    } finally {
      setProcessing(false);
    }
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      case 'PENDING':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';

    const parts = date.split('-');

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Summary for currently displayed applications
  const summary = useMemo(() => ({
    total: leaves.length,
    pending: leaves.filter(
      (leave) => leave.status === 'PENDING'
    ).length,
    approved: leaves.filter(
      (leave) => leave.status === 'APPROVED'
    ).length,
    rejected: leaves.filter(
      (leave) => leave.status === 'REJECTED'
    ).length
  }), [leaves]);

  return (
    <div className="dashboard-content">

      {/* Page Header */}
      <div className="dashboard-welcome mb-4">
        <div>
          <h3 className="fw-bold mb-1">Leave Management</h3>
          <p className="mb-0">
            Manage employee leave applications, approvals and rejections.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => fetchLeaves()}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Records
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
                <div className="dashboard-stat-label">Total Applications</div>
                <div className="dashboard-stat-value">{summary.total}</div>
                <div className="dashboard-stat-description">
                  Displayed applications
                </div>
              </div>
              <div className="dashboard-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-clipboard-data"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Pending</div>
                <div className="dashboard-stat-value text-warning">
                  {summary.pending}
                </div>
                <div className="dashboard-stat-description">
                  Awaiting review
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
                <div className="dashboard-stat-label">Approved</div>
                <div className="dashboard-stat-value text-success">
                  {summary.approved}
                </div>
                <div className="dashboard-stat-description">
                  Accepted applications
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
                <div className="dashboard-stat-label">Rejected</div>
                <div className="dashboard-stat-value text-danger">
                  {summary.rejected}
                </div>
                <div className="dashboard-stat-description">
                  Declined applications
                </div>
              </div>
              <div className="dashboard-stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-x-circle"></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="card dashboard-info-card mb-4">
        <div className="card-body p-4">

          <div className="d-flex align-items-center mb-3">
            <div className="dashboard-info-icon me-3">
              <i className="bi bi-funnel"></i>
            </div>
            <div>
              <h5 className="fw-bold mb-1">Application Filters</h5>
              <p className="text-muted small mb-0">
                Filter leave applications by their current status.
              </p>
            </div>
          </div>

          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Filter by Status
              </label>

              <select
                className="form-select"
                value={selectedStatus}
                onChange={(event) =>
                  filterByStatus(event.target.value)
                }
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="col-md-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSuccess('');
                  setError('');
                  fetchLeaves('ALL');
                }}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>
                Clear Filter
              </button>
            </div>

            <div className="col-md-3">
              <button
                className="btn btn-primary w-100"
                onClick={() => fetchLeaves()}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Leave Applications Table */}
      <div className="card dashboard-info-card mb-4">
        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-calendar2-week me-2 text-primary"></i>
                Employee Leave Applications
              </h5>
              <p className="text-muted small mb-0">
                Review employee leave requests and their current status.
              </p>
            </div>

            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              {leaves.length} Applications
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3"></div>
              <p className="text-muted mb-0">
                Loading leave applications...
              </p>
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="fw-semibold text-muted">
                        #{leave.id}
                      </td>

                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: '36px',
                              height: '36px',
                              flexShrink: 0
                            }}
                          >
                            <i className="bi bi-person"></i>
                          </div>

                          <span className="fw-semibold">
                            {leave.employeeName || '-'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-info-subtle text-info-emphasis">
                          {leave.leaveType || '-'}
                        </span>
                      </td>

                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>

                      <td>
                        <span
                          className="d-inline-block text-truncate"
                          style={{ maxWidth: '160px' }}
                          title={leave.reason || ''}
                        >
                          {leave.reason || '-'}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${getStatusBadge(leave.status)} px-3 py-2`}>
                          {leave.status || '-'}
                        </span>
                      </td>

                      <td>
                        {leave.status === 'PENDING' ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openReview(leave, 'APPROVED')}
                              disabled={processing}
                              title="Approve leave"
                            >
                              <i className="bi bi-check-lg me-1"></i>
                              Approve
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => openReview(leave, 'REJECTED')}
                              disabled={processing}
                              title="Reject leave"
                            >
                              <i className="bi bi-x-lg me-1"></i>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">
                            <i className="bi bi-check-circle me-1"></i>
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <i className="bi bi-calendar-x text-muted fs-2"></i>
                        <p className="fw-semibold mt-2 mb-1">
                          No leave applications found
                        </p>
                        <p className="text-muted small mb-0">
                          Try selecting another status filter.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

      {/* Leave Review Form */}
      {selectedLeave && (
        <div className="card dashboard-info-card mb-4">
          <div className="card-body p-4">

            <div className="d-flex align-items-center mb-4">
              <div className="dashboard-info-icon me-3">
                <i className="bi bi-clipboard-check"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1">
                  Review Leave Application #{selectedLeave.id}
                </h5>
                <p className="text-muted small mb-0">
                  Confirm your decision for this leave request.
                </p>
              </div>
            </div>

            <div className="row g-3 mb-4">

              <div className="col-md-4">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted d-block">Employee</small>
                  <strong>{selectedLeave.employeeName}</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted d-block">Leave Type</small>
                  <strong>{selectedLeave.leaveType}</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted d-block">Decision</small>
                  <span className={`badge ${getStatusBadge(reviewStatus)}`}>
                    {reviewStatus}
                  </span>
                </div>
              </div>

            </div>

            <form onSubmit={handleReview}>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Review Remarks
                  {reviewStatus === 'REJECTED' && (
                    <span className="text-danger"> *</span>
                  )}
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  maxLength="500"
                  value={reviewRemarks}
                  onChange={(event) =>
                    setReviewRemarks(event.target.value)
                  }
                  placeholder={
                    reviewStatus === 'REJECTED'
                      ? 'Enter reason for rejection (required)'
                      : 'Enter optional remarks'
                  }
                />

                <div className="text-end">
                  <small className="text-muted">
                    {reviewRemarks.length}/500 characters
                  </small>
                </div>
              </div>

              <button
                type="submit"
                className={`btn ${reviewStatus === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Confirm {reviewStatus}
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => {
                  setSelectedLeave(null);
                  setError('');
                }}
                disabled={processing}
              >
                Cancel
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Leaves;
