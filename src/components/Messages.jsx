import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Messages = ({ messages, currentUser, onRefresh }) => {
  const [tempMsg, setTempMsg] = useState('');

  const handleSendMessage = async () => {
    if (!tempMsg.trim()) return;
    await supabase.from('messages').insert([{ from_user: currentUser.name, text: tempMsg }]);
    setTempMsg('');
    onRefresh();
    alert('Message sent to Admin!');
  };

  const handleClearAll = async () => {
    if (window.confirm("Clear all messages?")) {
      await supabase.from('messages').delete().neq('from_user', 'system');
      onRefresh();
    }
  };

  return (
    <section className="card">
      <h3>{currentUser.role === 'admin' ? 'Admin Inbox' : 'Contact Admin'}</h3>
      
      {currentUser.role === 'staff' ? (
        <div className="msg-area">
          <textarea 
            style={{ marginBottom: '10px' }} 
            value={tempMsg} 
            onChange={e => setTempMsg(e.target.value)} 
            placeholder="Write your message here..." 
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </div>
      ) : (
        <div>
          <button 
            onClick={handleClearAll} 
            className="btn-del" 
            style={{ marginBottom: '15px' }}
          >
            Empty Inbox
          </button>
          
          {messages.length === 0 ? (
            <p>No new messages.</p>
          ) : (
            messages.map(m => (
              <div key={m.id} className="msg-item">
                <small>From: <strong>{m.from_user}</strong></small>
                <p>{m.text}</p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default Messages;