
function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    'Dashboard',
    'Employees',
    'Attendance',
    'Attendance Reports',
    'Leave Management',
    'Payroll',
    'Payslips',
    'Bank Accounts',
    'Transactions'
  ];

  return (
    <div className="col-md-2 sidebar">
      <h4>Payroll System</h4>

      <nav className="nav flex-column">
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`nav-link text-start border-0 ${
              activePage === item ? 'active' : ''
            }`}
            onClick={() => setActivePage(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
