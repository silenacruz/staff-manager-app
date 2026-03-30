import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Navbar from './components/Navbar';
import ShiftManager from './components/ShiftManager';
import StaffList from './components/StaffList';
import Messages from './components/Messages';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const [activeTab, setActiveTab] = useState('shifts');

  useEffect(() => {
    fetchData();
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

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    setCurrentUser(null);
  };

  if (!isLoggedIn) return <Login users={users} onLogin={(user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
  }} />;

  return (
    <div className="app-container">
      <Navbar 
        userName={currentUser?.name} 
        onLogout={logout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isAdmin={currentUser?.role === 'admin'}
        msgCount={messages.length}
      />

      <main className="content">
        {activeTab === 'shifts' && (
          <ShiftManager 
            shifts={shifts} 
            users={users} 
            currentUser={currentUser} 
            onRefresh={fetchData} 
          />
        )}
        
        {activeTab === 'staff' && currentUser?.role === 'admin' && (
          <StaffList users={users} onRefresh={fetchData} />
        )}
        
        {activeTab === 'messages' && (
          <Messages 
            messages={messages} 
            currentUser={currentUser} 
            onRefresh={fetchData} 
          />
        )}
      </main>
    </div>
  );
}

export default App;