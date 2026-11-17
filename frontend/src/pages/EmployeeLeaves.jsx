
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function EmployeeLeaves() {
  const { user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await api.get('/leaves/my');
      setLeaves(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError('Unable to load your leave applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (endDate < startDate) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason
      });

      setSuccess('Leave application submitted successfully!');

      setLeaveType('CASUAL');
      setStartDate('');
      setEndDate('');
      setReason('');

      await fetchMyLeaves();
    } catch (error) {
      console.error('Leave application failed:', error);

      setError(
        error.response?.data?.message ||
        'Unable to submit leave application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      default:
        return 'bg-warning text-dark';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        Loading your leave applications...
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      <h4>Leave Management</h4>

      <p className="text-muted">
        Welcome, {user.username}
      </p>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Apply for Leave */}
      <div className="card dashboard-card mt-4">
        <div className="card-body">

          <h5 className="mb-4">Apply for Leave</h5>

          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">
                  Leave Type
                </label>

                <select
                  className="form-select"
                  value={leaveType}
                  onChange={(event) =>
                    setLeaveType(event.target.value)
                  }
                  required
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                  <option value="PATERNITY">Paternity Leave</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Start Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  min={new Date().toLocaleDateString('en-CA')}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  End Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  min={startDate || new Date().toLocaleDateString('en-CA')}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  required
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">
                  Reason
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  maxLength="500"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Enter reason for leave"
                  required
                />

                <small className="text-muted">
                  {reason.length}/500 characters
                </small>
              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Leave Application'}
            </button>

          </form>

        </div>
      </div>

      {/* Leave History */}
      <div className="card dashboard-card mt-4">
        <div className="card-body">

          <h5 className="mb-3">My Leave Applications</h5>

          <p>Total Applications: {leaves.length}</p>

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Review Remarks</th>
                </tr>
              </thead>

              <tbody>

                {leaves.map((leave) => (
                  <tr key={leave.id}>

                    <td>{leave.id}</td>

                    <td>{leave.leaveType}</td>

                    <td>{leave.startDate}</td>

                    <td>{leave.endDate}</td>

                    <td>{leave.reason}</td>

                    <td>
                      <span className={`badge ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>

                    <td>{leave.reviewRemarks || '-'}</td>

                  </tr>
                ))}

                {leaves.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No leave applications found.
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

export default EmployeeLeaves;
