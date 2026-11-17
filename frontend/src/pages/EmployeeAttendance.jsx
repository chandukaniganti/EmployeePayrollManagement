
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function EmployeeAttendance() {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      const response = await api.get('/attendance/my');
      setAttendance(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Unable to load your attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      await api.post('/attendance/check-in');

      setSuccess('Check-in successful!');
      await fetchMyAttendance();
    } catch (error) {
      console.error('Check-in failed:', error);

      setError(
        error.response?.data?.message ||
        'Unable to check in.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      await api.post('/attendance/check-out');

      setSuccess('Check-out successful!');
      await fetchMyAttendance();
    } catch (error) {
      console.error('Check-out failed:', error);

      setError(
        error.response?.data?.message ||
        'Unable to check out.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const today = new Date().toLocaleDateString('en-CA');

  const todayAttendance = attendance.find(
    (record) => record.attendanceDate === today
  );

  if (loading) {
    return (
      <div className="dashboard-content">
        Loading your attendance...
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      <h4>My Attendance</h4>

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

      <div className="card dashboard-card mt-4">
        <div className="card-body">

          <h5>Today's Attendance</h5>

          <p>
            Date: {today}
          </p>

          <p>
            Check-In: {todayAttendance?.checkIn || 'Not checked in'}
          </p>

          <p>
            Check-Out: {todayAttendance?.checkOut || 'Not checked out'}
          </p>

          <p>
            Status: {todayAttendance?.status || 'Not marked'}
          </p>

          <div className="d-flex gap-3 mt-4">

            <button
              className="btn btn-success"
              onClick={handleCheckIn}
              disabled={processing || !!todayAttendance}
            >
              {processing ? 'Processing...' : 'Check In'}
            </button>

            <button
              className="btn btn-danger"
              onClick={handleCheckOut}
              disabled={
                processing ||
                !todayAttendance ||
                !!todayAttendance.checkOut
              }
            >
              {processing ? 'Processing...' : 'Check Out'}
            </button>

          </div>

        </div>
      </div>

      <div className="card dashboard-card mt-4">
        <div className="card-body">

          <h5 className="mb-3">My Attendance History</h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle">

              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td>{record.attendanceDate}</td>
                    <td>{record.checkIn || '-'}</td>
                    <td>{record.checkOut || '-'}</td>
                    <td>
                      {record.totalHours != null
                        ? `${record.totalHours} hrs`
                        : '-'}
                    </td>
                    <td>{record.status}</td>
                  </tr>
                ))}

                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No attendance history found.
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

export default EmployeeAttendance;
