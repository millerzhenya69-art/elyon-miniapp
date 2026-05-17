import React from 'react';
import './Sidebar.css';

export default function Sidebar({ chats, activeChatId, onSelect, onCreate, onDelete, onClose, onProfile, onSettings, user }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-mark">E</span>
          <span className="logo-text">Elyon</span>
        </div>
        <button className="sidebar-close" onClick={onClose}>✕</button>
      </div>

      {user && (
        <div className="sidebar-user" onClick={onProfile} style={{cursor:'pointer'}}>
          <div className="user-avatar">{(user.first_name || 'U')[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.first_name}</div>
            {user.username && <div className="user-handle">@{user.username}</div>}
          </div>
          <div style={{color:'var(--text-muted)',fontSize:'18px',marginLeft:'auto'}}>›</div>
        </div>
      )}

      <button className="new-chat-btn" onClick={onCreate}>
        <span className="new-chat-icon">+</span>
        New chat
      </button>

      <div className="chat-list">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => { onSelect(chat.id); onClose(); }}
          >
            <div className="chat-item-icon">💬</div>
            <div className="chat-item-title">{chat.title}</div>
            {chats.length > 1 && (
              <button
                className="chat-delete"
                onClick={e => { e.stopPropagation(); onDelete(chat.id); }}
              >✕</button>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="footer-btn" onClick={onSettings}>
          ⚙️ Customization
        </button>
        <div className="sidebar-version">Elyon AI v0.2</div>
      </div>
    </div>
  );
}
