import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const StaffList = ({ users, onRefresh }) => {
  const [newUser, setNewUser] = useState({ name: '', pass: '' });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.pass) return alert("Fill all fields");
    
    const { error } = await supabase
      .from('users')
      .insert([{ name: newUser.name, pass: newUser.pass, role: 'staff' }]);
    
    if (error) alert(error.message);
    else {
      setNewUser({ name: '', pass: '' });
      onRefresh();
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await supabase.from('users').delete().eq('id', id);
      onRefresh();
    }
  };

  return (
    <section className="card">
      <h3>Staff Management</h3>
      <form className="grid-form" onSubmit={handleCreateUser} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={newUser.name} 
          onChange={e => setNewUser({...newUser, name: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="Temp Password" 
          value={newUser.pass} 
          onChange={e => setNewUser({...newUser, pass: e.target.value})} 
        />
        <button type="submit">Add User</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.filter(u => u.role !== 'admin').map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td><code>{u.pass}</code></td>
              <td>
                <button className="btn-del" onClick={() => handleDeleteUser(u.id, u.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default StaffList;