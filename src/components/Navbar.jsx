import React from 'react';

const Navbar = ({ userName, onLogout, activeTab, setActiveTab, isAdmin, msgCount }) => {
  return (
    <header className="main-header">
      {/* FILA SUPERIOR: Logo y Usuario alineados con justify-content: space-between */}
      <div className="header-top">
        <h1 className="logo-title">StaffManager</h1>
        
        <div className="user-nav-container">
          <div className="user-info">
            <span>Hello,</span>
            <strong>{userName}</strong>
          </div>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      {/* FILA INFERIOR: Botones con flex: 1 para que midan lo mismo */}
      <nav className="tabs">
        <div className="tab-item">
          <button 
            className={activeTab === 'shifts' ? 'active' : ''} 
            onClick={() => setActiveTab('shifts')}
          >
            Shifts
          </button>
        </div>

        {isAdmin && (
          <div className="tab-item">
            <button 
              className={activeTab === 'staff' ? 'active' : ''} 
              onClick={() => setActiveTab('staff')}
            >
              Staff
            </button>
          </div>
        )}

        <div className="tab-item">
          <button 
            className={activeTab === 'messages' ? 'active' : ''} 
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
          {isAdmin && msgCount > 0 && (
            <span className="notification-badge">{msgCount}</span>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;