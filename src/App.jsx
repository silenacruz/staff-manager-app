import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  // --- DATA STATES ---
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [messages, setMessages] = useState([]);

  // --- PERSISTENCE & UI STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('shifts');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // --- FORM STATES ---
  const [loginData, setLoginData] = useState({ name: '', pass: '' });
  const [newShift, setNewShift] = useState({ employeeId: '', day: '', time: '' });
  const [newUser, setNewUser] = useState({ name: '', pass: '' });
  const [tempMsg, setTempMsg] = useState('');

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchData();
    // Auto-refresh data every 30 seconds to check for new messages
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const { data: u } = await supabase.from('users').select('*');
    const { data: s } = await supabase.from('shifts').select('*');
    const { data: m } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (u) setUsers(u);
    if (s) setShifts(s);
    if (m) setMessages(m);
  };

  // --- AUTH LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(u => u.name.toLowerCase() === loginData.name.trim().toLowerCase() && u.pass === loginData.pass);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(found));
      if (found.role === 'staff') setSearchTerm(found.name);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    setLoginData({ name: '', pass: '' });
    setActiveTab('shifts');
    setSearchTerm('');
  };

  // --- ACTIONS ---
  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.pass) return alert("Fill all fields");
    const { error } = await supabase.from('users').insert([{ name: newUser.name, pass: newUser.pass, role: 'staff' }]);
    if (error) alert(error.message);
    else { setNewUser({ name: '', pass: '' }); fetchData(); }
  };

  const addShift = async (e) => {
    e.preventDefault();
    if (!newShift.employeeId || !newShift.day || !newShift.time) return alert("Missing data");
    const emp = users.find(u => u.id === newShift.employeeId);
    await supabase.from('shifts').insert([{ name: emp.name, day: newShift.day, time: newShift.time }]);
    setNewShift({ employeeId: '', day: '', time: '' });
    fetchData();
  };

  const deleteShift = async (id) => {
    await supabase.from('shifts').delete().eq('id', id);
    fetchData();
  };

  const clearMessages = async () => {
    if (window.confirm("Delete all messages?")) {
      await supabase.from('messages').delete().neq('from_user', 'system');
      fetchData();
    }
  };

  // --- SORTING LOGIC ---
  const sortedShifts = [...shifts]
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.day.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'day') return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      return 0;
    });

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <form className="login-box" onSubmit={handleLogin}>
          <h2 style={{textAlign:'center', marginBottom:'10px'}}>Staff Login</h2>
          <input type="text" placeholder="Username" value={loginData.name} onChange={e => setLoginData({...loginData, name: e.target.value})} required />
          <input type="password" placeholder="Password" value={loginData.pass} onChange={e => setLoginData({...loginData, pass: e.target.value})} required />
          <button type="submit" style={{width:'100%', marginTop:'10px'}}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>StaffManager</h1>
        <div className="user-nav">
          <span>Hello, <strong>{currentUser?.name}</strong></span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <nav className="tabs">
        <div className="tab-button-container">
            <button className={activeTab === 'shifts' ? 'active' : ''} onClick={() => setActiveTab('shifts')}>Shifts</button>
        </div>
        
        {currentUser?.role === 'admin' && (
          <div className="tab-button-container">
            <button className={activeTab === 'staff' ? 'active' : ''} onClick={() => setActiveTab('staff')}>Staff List</button>
          </div>
        )}

        <div className="tab-button-container">
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
                Messages
            </button>
            {/* NOTIFICATION BADGE FOR ADMIN */}
            {currentUser?.role === 'admin' && messages.length > 0 && (
                <div className="notification-badge">{messages.length}</div>
            )}
        </div>
      </nav>

      <div className="content">
        {activeTab === 'shifts' && (
          <>
            <section className="card">
              <h3>Search & Sort</h3>
              <div className="search-controls">
                <input type="text" placeholder="Search shifts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} disabled={currentUser?.role === 'staff'} />
                <div className="sort-buttons">
                  <span>Sort by:</span>
                  <button className={sortBy === 'name' ? 'btn-mini active' : 'btn-mini'} onClick={() => setSortBy('name')}>Name</button>
                  <button className={sortBy === 'day' ? 'btn-mini active' : 'btn-mini'} onClick={() => setSortBy('day')}>Day</button>
                </div>
              </div>
            </section>

            {currentUser?.role === 'admin' && (
              <section className="card">
                <h3>Assign New Shift</h3>
                <form className="grid-form" onSubmit={addShift}>
                  <select value={newShift.employeeId} onChange={e => setNewShift({...newShift, employeeId: e.target.value})} required>
                    <option value="">Choose Employee...</option>
                    {users.filter(u => u.role === 'staff').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <select value={newShift.day} onChange={e => setNewShift({...newShift, day: e.target.value})} required>
                    <option value="">Choose Day...</option>
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="text" placeholder="Time (e.g. 09:00 - 17:00)" value={newShift.time} onChange={e => setNewShift({...newShift, time: e.target.value})} required />
                  <button type="submit">Assign</button>
                </form>
              </section>
            )}

            <section className="card">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Day</th><th>Hours</th>{currentUser?.role === 'admin' && <th>Action</th>}</tr></thead>
                <tbody>
                  {sortedShifts.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="day-label">{s.day}</span></td>
                      <td>{s.time}</td>
                      {currentUser?.role === 'admin' && <td><button className="btn-del" onClick={() => deleteShift(s.id)}>Delete</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {activeTab === 'staff' && currentUser?.role === 'admin' && (
          <section className="card">
            <h3>Staff Management</h3>
            <form className="grid-form" onSubmit={createUser} style={{marginBottom:'20px'}}>
              <input type="text" placeholder="New Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <input type="text" placeholder="New Password" value={newUser.pass} onChange={e => setNewUser({...newUser, pass: e.target.value})} />
              <button type="submit">Add User</button>
            </form>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Password</th><th>Action</th></tr></thead>
              <tbody>
                {users.filter(u => u.role !== 'admin').map(u => (
                  <tr key={u.id}><td>{u.name}</td><td><code>{u.pass}</code></td><td><button className="btn-del" onClick={() => { if(window.confirm('Delete user?')) supabase.from('users').delete().eq('id', u.id).then(fetchData) }}>Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="card">
            <h3>{currentUser?.role === 'admin' ? 'Inbox' : 'Send Message'}</h3>
            {currentUser?.role === 'staff' ? (
              <div className="msg-area">
                <textarea style={{marginBottom:'10px'}} value={tempMsg} onChange={e => setTempMsg(e.target.value)} placeholder="Send a message to admin..." />
                <button onClick={async () => { 
                    if(!tempMsg) return;
                    await supabase.from('messages').insert([{ from_user: currentUser.name, text: tempMsg }]); 
                    setTempMsg(''); 
                    fetchData(); 
                    alert('Sent!'); 
                }}>Send</button>
              </div>
            ) : (
              <div>
                <button onClick={clearMessages} className="btn-del" style={{marginBottom: '15px'}}>Clear Inbox</button>
                {messages.length === 0 ? <p>No messages yet.</p> : messages.map(m => (
                  <div key={m.id} className="msg-item">
                    <small>From: <strong>{m.from_user}</strong></small>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default App;