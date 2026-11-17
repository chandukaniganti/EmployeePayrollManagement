
import { useState } from 'react';
import api from '../services/api';

function AttendanceReports() {
  const currentDate = new Date();

  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(
        `/attendance/monthly-report?month=${month}&year=${year}`
      );

      setReports(response.data);
      setGenerated(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to generate attendance report.'
      );
      setReports([]);
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const totalPresent = reports.reduce(
    (sum, item) => sum + item.presentDays, 0
  );

  const totalAbsent = reports.reduce(
    (sum, item) => sum + item.absentDays, 0
  );

  const totalHalfDays = reports.reduce(
    (sum, item) => sum + item.halfDays, 0
  );

  const totalHours = reports.reduce(
    (sum, item) => sum + item.totalHours, 0
  );

  return (
    <div className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-1">Monthly Attendance Report</h4>
          <p className="text-muted mb-0">
            View employee attendance summaries by month.
          </p>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Select Month</label>
              <select
                className="form-select"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {monthNames.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Select Year</label>
              <input
                type="number"
                className="form-control"
                value={year}
                min="2000"
                max="2100"
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <div className="col-md-4">
              <button
                className="btn btn-primary w-100"
                onClick={generateReport}
                disabled={loading || !year || year < 2000 || year > 2100}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {generated && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-muted mb-1">Present Days</p>
                  <h3 className="text-success mb-0">{totalPresent}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-muted mb-1">Absent Days</p>
                  <h3 className="text-danger mb-0">{totalAbsent}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-muted mb-1">Half Days</p>
                  <h3 className="text-warning mb-0">{totalHalfDays}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-muted mb-1">Total Working Hours</p>
                  <h3 className="mb-0">{totalHours.toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">
                {monthNames[month - 1]} {year} Attendance
              </h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Total Records</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Half Days</th>
                      <th>Total Hours</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reports.length > 0 ? (
                      reports.map((item) => (
                        <tr key={item.employeeId}>
                          <td>{item.employeeId}</td>
                          <td>{item.employeeName}</td>
                          <td>{item.totalRecords}</td>
                          <td className="text-success fw-semibold">
                            {item.presentDays}
                          </td>
                          <td className="text-danger fw-semibold">
                            {item.absentDays}
                          </td>
                          <td className="text-warning fw-semibold">
                            {item.halfDays}
                          </td>
                          <td>{Number(item.totalHours).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No attendance records found for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AttendanceReports;
