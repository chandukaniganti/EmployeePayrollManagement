
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    employeeId: '',
    attendanceDate: '',
    checkIn: '',
    checkOut: '',
    status: 'PRESENT'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/attendance');
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Unable to load employee details.');
    }
  };

  const filterByDate = async () => {
    if (!selectedDate) {
      setError('Please select a date.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.get('/attendance/date', {
        params: { date: selectedDate }
      });

      setAttendance(response.data);
    } catch (error) {
      console.error('Error filtering attendance:', error);
      setError('Unable to filter attendance by date.');
    } finally {
      setLoading(false);
    }
  };

  const filterByEmployee = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.get(
        `/attendance/employee/${selectedEmployee}`
      );

      setAttendance(response.data);
    } catch (error) {
      console.error('Error filtering attendance:', error);
      setError('Unable to filter attendance by employee.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedDate('');
    setSelectedEmployee('');
    fetchAttendance();
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingId(record.id);

    setFormData({
      employeeId: String(record.employeeId),
      attendanceDate: record.attendanceDate || '',
      checkIn: record.checkIn ? record.checkIn.slice(0, 5) : '',
      checkOut: record.checkOut ? record.checkOut.slice(0, 5) : '',
      status: record.status || 'PRESENT'
    });

    setError('');
    setSuccess('');
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const saveAttendance = async (event) => {
    event.preventDefault();

    if (!formData.employeeId || !formData.attendanceDate) {
      setError('Please select an employee and attendance date.');
      return;
    }

    if (formData.checkOut && !formData.checkIn) {
      setError('Check-in time is required when check-out time is provided.');
      return;
    }

    if (formData.checkIn && formData.checkOut &&
        formData.checkOut < formData.checkIn) {
      setError('Check-out time cannot be before check-in time.');
      return;
    }

    const payload = {
      employeeId: Number(formData.employeeId),
      attendanceDate: formData.attendanceDate,
      checkIn: formData.checkIn || null,
      checkOut: formData.checkOut || null,
      status: formData.status
    };

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingId) {
        await api.put(`/attendance/${editingId}`, payload);
        setSuccess('Attendance record updated successfully.');
      } else {
        await api.post('/attendance', payload);
        setSuccess('Attendance record created successfully.');
      }

      closeForm();
      await fetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);

      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Unable to save attendance record. Please check the details.'
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAttendance = async (record) => {
    const confirmed = window.confirm(
      `Delete attendance record #${record.id} for ${record.employeeName}?`
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(`/attendance/${record.id}`);

      setSuccess('Attendance record deleted successfully.');
      await fetchAttendance();
    } catch (error) {
      console.error('Error deleting attendance:', error);

      setError(
        error.response?.data?.message ||
        'Unable to delete attendance record.'
      );
    }
  };

  const summary = useMemo(() => {
    return {
      total: attendance.length,
      present: attendance.filter(
        (record) => record.status === 'PRESENT'
      ).length,
      halfDay: attendance.filter(
        (record) => record.status === 'HALF_DAY'
      ).length,
      absent: attendance.filter(
        (record) => record.status === 'ABSENT'
      ).length
    };
  }, [attendance]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-success';
      case 'HALF_DAY':
        return 'bg-warning text-dark';
      case 'ABSENT':
        return 'bg-danger';
      case 'ON_LEAVE':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary';
    }
  };

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
          <h3 className="fw-bold mb-1">Attendance Management</h3>
          <p className="mb-0">
            Monitor employee attendance, working hours and daily records.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-primary"
            onClick={fetchAttendance}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>

          <button
            className="btn btn-primary"
            onClick={openAddForm}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Attendance
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {/* Add / Edit Attendance Form */}
      {showForm && (
        <div className="card dashboard-info-card mb-4">
          <div className="card-body p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-calendar-plus text-primary me-2"></i>
                  {editingId ? 'Edit Attendance' : 'Add Attendance'}
                </h5>

                <p className="text-muted small mb-0">
                  Enter or correct an employee's attendance details.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={closeForm}
              >
                <i className="bi bi-x-lg me-1"></i>
                Close
              </button>
            </div>

            <form onSubmit={saveAttendance}>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Employee *
                  </label>

                  <select
                    className="form-select"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Employee</option>

                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Attendance Date *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    name="attendanceDate"
                    value={formData.attendanceDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Check-In Time
                  </label>

                  <input
                    type="time"
                    className="form-control"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Check-Out Time
                  </label>

                  <input
                    type="time"
                    className="form-control"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Attendance Status *
                  </label>

                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="PRESENT">Present</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>

                <div className="col-12">
                  <div className="alert alert-info small mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Working hours are calculated automatically when both
                    check-in and check-out times are provided. The backend
                    may automatically adjust the status based on working hours.
                  </div>
                </div>

                <div className="col-12 d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
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
                        {editingId ? 'Update Attendance' : 'Save Attendance'}
                      </>
                    )}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Total Records</div>
                <div className="dashboard-stat-value">{summary.total}</div>
                <div className="dashboard-stat-description">
                  Displayed attendance records
                </div>
              </div>
              <div className="dashboard-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-calendar-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Present</div>
                <div className="dashboard-stat-value text-success">
                  {summary.present}
                </div>
                <div className="dashboard-stat-description">
                  Full-day attendance
                </div>
              </div>
              <div className="dashboard-stat-icon bg-success-subtle text-success">
                <i className="bi bi-person-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Half Day</div>
                <div className="dashboard-stat-value text-warning">
                  {summary.halfDay}
                </div>
                <div className="dashboard-stat-description">
                  Partial-day attendance
                </div>
              </div>
              <div className="dashboard-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card dashboard-stat-card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="dashboard-stat-label">Absent</div>
                <div className="dashboard-stat-value text-danger">
                  {summary.absent}
                </div>
                <div className="dashboard-stat-description">
                  Absence records
                </div>
              </div>
              <div className="dashboard-stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-person-x"></i>
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
              <h5 className="fw-bold mb-1">Attendance Filters</h5>
              <p className="text-muted small mb-0">
                Find attendance records by date or employee.
              </p>
            </div>
          </div>

          <div className="row g-3 align-items-end">

            <div className="col-md-5">
              <label className="form-label fw-semibold">
                <i className="bi bi-calendar3 me-2"></i>
                Filter by Date
              </label>

              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />

              <button
                className="btn btn-primary w-100 mt-2"
                onClick={filterByDate}
                disabled={loading}
              >
                <i className="bi bi-search me-2"></i>
                Search by Date
              </button>
            </div>

            <div className="col-md-5">
              <label className="form-label fw-semibold">
                <i className="bi bi-person me-2"></i>
                Filter by Employee
              </label>

              <select
                className="form-select"
                value={selectedEmployee}
                onChange={(event) => setSelectedEmployee(event.target.value)}
              >
                <option value="">Select Employee</option>

                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-primary w-100 mt-2"
                onClick={filterByEmployee}
                disabled={loading}
              >
                <i className="bi bi-search me-2"></i>
                Search by Employee
              </button>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>
                Clear
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card dashboard-info-card">
        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-list-ul me-2 text-primary"></i>
                Attendance Records
              </h5>
              <p className="text-muted small mb-0">
                Employee check-in, check-out and attendance status.
              </p>
            </div>

            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              {attendance.length} Records
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3"></div>
              <p className="text-muted mb-0">
                Loading attendance records...
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td className="fw-semibold text-muted">
                        #{record.id}
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
                            {record.employeeName || '-'}
                          </span>
                        </div>
                      </td>

                      <td>{formatDate(record.attendanceDate)}</td>

                      <td>
                        <span className="text-success fw-semibold">
                          {record.checkIn || '-'}
                        </span>
                      </td>

                      <td>
                        <span className="text-danger fw-semibold">
                          {record.checkOut || '-'}
                        </span>
                      </td>

                      <td>
                        {record.totalHours != null
                          ? `${record.totalHours} hrs`
                          : '-'}
                      </td>

                      <td>
                        <span className={`badge ${getStatusClass(record.status)} px-3 py-2`}>
                          {record.status || '-'}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex justify-content-center gap-2">
  <button
    className="btn btn-sm btn-outline-primary"
    title="Edit attendance"
    onClick={() => openEditForm(record)}
  >
    <i className="bi bi-pencil-square me-1"></i>
    Edit
  </button>

  <button
    className="btn btn-sm btn-outline-danger"
    title="Delete attendance"
    onClick={() => deleteAttendance(record)}
  >
    <i className="bi bi-trash me-1"></i>
    Delete
  </button>
</div>
                      </td>
                    </tr>
                  ))}

                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <i className="bi bi-calendar-x text-muted fs-2"></i>
                        <p className="fw-semibold mt-2 mb-1">
                          No attendance records found
                        </p>
                        <p className="text-muted small mb-0">
                          Try changing your filters or clearing them.
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

    </div>
  );
}

export default Attendance;
