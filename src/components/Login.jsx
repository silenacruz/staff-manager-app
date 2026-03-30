import React, { useState } from 'react';

const Login = ({ users, onLogin }) => {
  const [loginData, setLoginData] = useState({ name: '', pass: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = users.find(
      u => u.name.toLowerCase() === loginData.name.trim().toLowerCase() && 
      u.pass === loginData.pass
    );

    if (found) {
      onLogin(found);
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-screen">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>Staff Login</h2>
        <input 
          type="text" 
          placeholder="Username" 
          value={loginData.name} 
          onChange={e => setLoginData({...loginData, name: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={loginData.pass} 
          onChange={e => setLoginData({...loginData, pass: e.target.value})} 
          required 
        />
        <button type="submit" style={{ width: '100%', marginTop: '10px' }}>Enter</button>
      </form>
    </div>
  );
};

export default Login;