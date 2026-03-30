import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ShiftManager = ({ shifts, users, currentUser, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState(currentUser.role === 'staff' ? currentUser.name : '');
  const [sortBy, setSortBy] = useState('name');
  const [newShift, setNewShift] = useState({ employeeId: '', day: '', time: '' });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleAddShift = async (e) => {
    e.preventDefault();
    const emp = users.find(u => u.id === newShift.employeeId);
    await supabase.from('shifts').insert([{ name: emp.name, day: newShift.day, time: newShift.time }]);
    setNewShift({ employeeId: '', day: '', time: '' });
    onRefresh();
  };

  const sortedShifts = [...shifts]
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortBy === 'name' 
      ? a.name.localeCompare(b.name) 
      : daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day)
    );

  return (
    <>
      <section className="card">
        <h3>Search & Sort</h3>
        <div className="search-controls">
          <input 
            type="text" 
            placeholder="Search shifts..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            disabled={currentUser.role === 'staff'} 
          />
          <div className="sort-buttons">
            <button className={sortBy === 'name' ? 'btn-mini active' : 'btn-mini'} onClick={() => setSortBy('name')}>Name</button>
            <button className={sortBy === 'day' ? 'btn-mini active' : 'btn-mini'} onClick={() => setSortBy('day')}>Day</button>
          </div>
        </div>
      </section>

      {currentUser.role === 'admin' && (
        <section className="card">
          <h3>Assign New Shift</h3>
          <form className="grid-form" onSubmit={handleAddShift}>
            <select value={newShift.employeeId} onChange={e => setNewShift({...newShift, employeeId: e.target.value})} required>
              <option value="">Employee...</option>
              {users.filter(u => u.role === 'staff').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={newShift.day} onChange={e => setNewShift({...newShift, day: e.target.value})} required>
              <option value="">Day...</option>
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="text" placeholder="Time (9am-5pm)" value={newShift.time} onChange={e => setNewShift({...newShift, time: e.target.value})} required />
            <button type="submit">Assign</button>
          </form>
        </section>
      )}

      <section className="card">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Day</th><th>Hours</th>{currentUser.role === 'admin' && <th>Action</th>}</tr></thead>
          <tbody>
            {sortedShifts.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td><span className="day-label">{s.day}</span></td>
                <td>{s.time}</td>
                {currentUser.role === 'admin' && (
                  <td><button className="btn-del" onClick={async () => { await supabase.from('shifts').delete().eq('id', s.id); onRefresh(); }}>X</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default ShiftManager;