import React, { useState, useEffect } from 'react';
import './index.css';
import { useTelegram } from './hooks/useTelegram';
import { useChats } from './hooks/useChats';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import Profile from './components/Profile';
import Settings from './components/Settings';

const ACCENT_COLORS = {
  violet: { accent: '#7c3aed', light: '#9d5cf6', dim: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
  blue:   { accent: '#2563eb', light: '#3b82f6', dim: 'rgba(37,99,235,0.15)',  border: 'rgba(37,99,235,0.3)' },
  pink:   { accent: '#db2777', light: '#ec4899', dim: 'rgba(219,39,119,0.15)', border: 'rgba(219,39,119,0.3)' },
  green:  { accent: '#059669', light: '#10b981', dim: 'rgba(5,150,105,0.15)',  border: 'rgba(5,150,105,0.3)' },
};

const THEME_VARS = {
  dark:   { bg: '#0a0a0f', secondary: '#111118', card: '#16161f', hover: '#1e1e2a', input: '#13131a', text: '#f0f0f8', textSec: '#8888a8', textMuted: '#55556a' },
  amoled: { bg: '#000000', secondary: '#0a0a0a', card: '#111111', hover: '#1a1a1a', input: '#080808', text: '#ffffff',  textSec: '#888899', textMuted: '#444455' },
  light:  { bg: '#f5f5fa', secondary: '#ffffff',  card: '#ebebf5', hover: '#e0e0ee', input: '#f0f0f8', text: '#111118', textSec: '#555566', textMuted: '#999aaa' },
};

const FONT_SIZES = { small: '13px', medium: '15px', large: '17px' };

function applySettings(settings) {
  const root = document.documentElement;
  const t = THEME_VARS[settings.theme] || THEME_VARS.dark;
  const a = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.violet;
  const fs = FONT_SIZES[settings.fontSize] || '15px';

  root.style.setProperty('--bg-primary',    t.bg);
  root.style.setProperty('--bg-secondary',  t.secondary);
  root.style.setProperty('--bg-card',       t.card);
  root.style.setProperty('--bg-hover',      t.hover);
  root.style.setProperty('--bg-input',      t.input);
  root.style.setProperty('--text-primary',  t.text);
  root.style.setProperty('--text-secondary',t.textSec);
  root.style.setProperty('--text-muted',    t.textMuted);
  root.style.setProperty('--accent',        a.accent);
  root.style.setProperty('--accent-light',  a.light);
  root.style.setProperty('--accent-dim',    a.dim);
  root.style.setProperty('--accent-border', a.border);
  root.style.setProperty('--font-size',     fs);
  document.body.style.fontSize = fs;
}

const DEFAULT_SETTINGS = { theme: 'dark', accent: 'violet', fontSize: 'medium' };

function loadSettings() {
  try { return JSON.parse(localStorage.getItem('elyon_settings')) || DEFAULT_SETTINGS; }
  catch { return DEFAULT_SETTINGS; }
}

export default function App() {
  const { user, userId, haptic, isFullscreen, toggleFullscreen } = useTelegram();
  const { chats, activeChat, activeChatId, setActiveChatId, createChat, deleteChat, sendMessage, setModel, loading } = useChats(userId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screen, setScreen] = useState('chat'); // 'chat' | 'profile' | 'settings'
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    applySettings(settings);
    try { localStorage.setItem('elyon_settings', JSON.stringify(settings)); } catch {}
  }, [settings]);

  const handleMenuOpen  = () => { haptic('light'); setSidebarOpen(true); };
  const handleSidebarClose = () => setSidebarOpen(false);
  const handleCreateChat = () => { haptic('medium'); createChat(); setSidebarOpen(false); };

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {sidebarOpen && (
        <div onClick={handleSidebarClose} style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease'
        }}/>
      )}

      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 20,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: sidebarOpen ? '4px 0 40px rgba(0,0,0,0.6)' : 'none'
      }}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onCreate={handleCreateChat}
          onDelete={deleteChat}
          onClose={handleSidebarClose}
          onProfile={() => { setSidebarOpen(false); setScreen('profile'); }}
          onSettings={() => { setSidebarOpen(false); setScreen('settings'); }}
          user={user}
        />
      </div>

      <ChatView
        chat={activeChat}
        loading={loading}
        onSend={(text) => { haptic('light'); sendMessage(text); }}
        onMenuOpen={handleMenuOpen}
        onModelChange={(model) => { haptic('light'); setModel(model); }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {screen === 'profile' && (
        <Profile userId={userId} onClose={() => setScreen('chat')} />
      )}

      {screen === 'settings' && (
        <Settings
          settings={settings}
          onChange={setSettings}
          onClose={() => setScreen('chat')}
        />
      )}
    </div>
  );
}
