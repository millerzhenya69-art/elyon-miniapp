import React, { useState } from 'react';
import './index.css';
import { useTelegram } from './hooks/useTelegram';
import { useChats } from './hooks/useChats';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';

export default function App() {
  const { user, userId, haptic } = useTelegram();
  const { chats, activeChat, activeChatId, setActiveChatId, createChat, deleteChat, sendMessage, setModel, loading } = useChats(userId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuOpen = () => {
    haptic('light');
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleCreateChat = () => {
    haptic('medium');
    createChat();
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={handleSidebarClose}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 20,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: sidebarOpen ? '4px 0 40px rgba(0,0,0,0.6)' : 'none'
      }}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onCreate={handleCreateChat}
          onDelete={deleteChat}
          onClose={handleSidebarClose}
          user={user}
        />
      </div>

      {/* Main chat */}
      <ChatView
        chat={activeChat}
        loading={loading}
        onSend={(text) => { haptic('light'); sendMessage(text); }}
        onMenuOpen={handleMenuOpen}
        onModelChange={(model) => { haptic('light'); setModel(model); }}
      />
    </div>
  );
}
