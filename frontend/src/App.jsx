
import { useState } from 'react';
import './App.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeLeaves from './pages/EmployeeLeaves';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Payslips from './pages/Payslips';
import BankAccounts from './pages/BankAccounts';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import AttendanceReports from './pages/AttendanceReports';

import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState('Dashboard');

  if (!user) {
    return <Login />;
  }

  // Employee Portal
  if (user.role === 'EMPLOYEE') {
    return (
      <div className="container-fluid app-container">
        <div className="topbar d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Employee Portal</h5>

          <div className="d-flex align-items-center gap-3">
            <span className="text-muted">
              Welcome, {user.username} ({user.role})
            </span>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <button
              className={`btn ${
                activePage === 'Dashboard'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => setActivePage('Dashboard')}
            >
              <i className="bi bi-grid me-2" />
              Dashboard
            </button>

            <button
              className={`btn ${
                activePage === 'My Attendance'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => setActivePage('My Attendance')}
            >
              <i className="bi bi-calendar-check me-2" />
              My Attendance
            </button>

            <button
              className={`btn ${
                activePage === 'My Leaves'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => setActivePage('My Leaves')}
            >
              <i className="bi bi-calendar2-minus me-2" />
              My Leaves
            </button>

            <button
              className={`btn ${
                activePage === 'My Payslips'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => setActivePage('My Payslips')}
            >
              <i className="bi bi-file-earmark-text me-2" />
              My Payslips
            </button>

            <button
              className={`btn ${
                activePage === 'My Bank Account'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => setActivePage('My Bank Account')}
            >
              <i className="bi bi-bank me-2" />
              My Bank Account
            </button>

            <button
              className={`btn ${
                activePage === 'My Transactions'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => setActivePage('My Transactions')}
            >
              <i className="bi bi-credit-card me-2" />
              My Transactions
            </button>
          </div>
        </div>

        {activePage === 'Dashboard' && (
          <EmployeeDashboard setActivePage={setActivePage} />
        )}

        {activePage === 'My Attendance' && <EmployeeAttendance />}

        {activePage === 'My Leaves' && <EmployeeLeaves />}

        {activePage === 'My Payslips' && <Payslips />}

        {activePage === 'My Bank Account' && <BankAccounts />}

        {activePage === 'My Transactions' && <Transactions />}
      </div>
    );
  }

  // ADMIN / HR Application
  return (
    <div className="container-fluid app-container">
      <div className="row">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <div className="col-md-10">
          <div className="topbar d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{activePage}</h5>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">
                Welcome, {user.username} ({user.role})
              </span>

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>

          {activePage === 'Dashboard' && <Dashboard />}

          {activePage === 'Employees' && <Employees />}

          {activePage === 'Attendance' && <Attendance />}

          {activePage === 'Attendance Reports' && <AttendanceReports />}

          {activePage === 'Leave Management' && <Leaves />}

          {activePage === 'Payroll' && <Payroll />}

          {activePage === 'Payslips' && <Payslips />}

          {activePage === 'Bank Accounts' && <BankAccounts />}

          {activePage === 'Transactions' && <Transactions />}

          {activePage !== 'Dashboard' &&
            activePage !== 'Employees' &&
            activePage !== 'Attendance' &&
            activePage !== 'Attendance Reports' &&
            activePage !== 'Leave Management' &&
            activePage !== 'Payroll' &&
            activePage !== 'Payslips' &&
            activePage !== 'Bank Accounts' &&
            activePage !== 'Transactions' && (
              <div className="dashboard-content">
                <h4>{activePage}</h4>
                <p className="text-muted">
                  {activePage} module will be developed next.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;
