
import { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    monthlyPayroll: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        const dateString = [
          year,
          String(month).padStart(2, '0'),
          String(today.getDate()).padStart(2, '0')
        ].join('-');

        const results = await Promise.allSettled([
          api.get('/employees'),
          api.get(`/attendance/date?date=${dateString}`),
          api.get('/leaves/status?status=PENDING'),
          api.get(`/payroll/month?month=${month}&year=${year}`)
        ]);

        const employees = results[0].status === 'fulfilled'
          ? results[0].value.data : [];

        const attendance = results[1].status === 'fulfilled'
          ? results[1].value.data : [];

        const leaves = results[2].status === 'fulfilled'
          ? results[2].value.data : [];

        const payroll = results[3].status === 'fulfilled'
          ? results[3].value.data : [];

        const monthlyPayroll = payroll.reduce(
          (total, record) => total + Number(record.netSalary || 0),
          0
        );

        setStats({
          totalEmployees: Array.isArray(employees) ? employees.length : 0,
          presentToday: Array.isArray(attendance) ? attendance.length : 0,
          pendingLeaves: Array.isArray(leaves) ? leaves.length : 0,
          monthlyPayroll
        });

        if (results.some(result => result.status === 'rejected')) {
          setError('Some dashboard information could not be loaded.');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Unable to load dashboard information.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = amount =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);

  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: 'bi-people-fill',
      color: '#4361ee',
      background: '#eef1ff',
      description: 'Registered employees'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: 'bi-person-check-fill',
      color: '#16a36a',
      background: '#e8f8f0',
      description: 'Attendance records today'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: 'bi-calendar2-week-fill',
      color: '#e69a18',
      background: '#fff5df',
      description: 'Awaiting approval'
    },
    {
      title: 'Monthly Payroll',
      value: formatCurrency(stats.monthlyPayroll),
      icon: 'bi-wallet2',
      color: '#7952b3',
      background: '#f2ebff',
      description: 'Total net salary'
    }
  ];

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome mb-4">
        <div>
          <h3 className="fw-bold mb-2">Dashboard Overview</h3>
          <p className="mb-0">
            Here's what's happening in your organization today.
          </p>
        </div>
        <div className="dashboard-date">
          <i className="bi bi-calendar3 me-2"></i>
          {new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>

      {error && (
        <div className="alert alert-warning">{error}</div>
      )}

      <div className="row g-4">
        {cards.map((card) => (
          <div className="col-12 col-sm-6 col-xl-3" key={card.title}>
            <div className="card dashboard-stat-card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="dashboard-stat-label">{card.title}</p>
                    <h3 className="dashboard-stat-value">
                      {loading ? '...' : card.value}
                    </h3>
                  </div>

                  <div
                    className="dashboard-stat-icon"
                    style={{
                      color: card.color,
                      backgroundColor: card.background
                    }}
                  >
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                </div>

                <p className="dashboard-stat-description mb-0">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card dashboard-info-card">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="dashboard-info-icon">
                  <i className="bi bi-building"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">
                    Employee Payroll Management System
                  </h5>
                  <p className="text-muted mb-0">
                    Organization management at a glance
                  </p>
                </div>
              </div>

              <p className="text-muted mb-0">
                Manage employees, attendance, leave requests,
                payroll generation, payslips, bank accounts
                and payment transactions from one centralized system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
