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
  orange: { accent: '#ea580c', light: '#f97316', dim: 'rgba(234,88,12,0.15)',  border: 'rgba(234,88,12,0.3)' },
  cyan:   { accent: '#0891b2', light: '#06b6d4', dim: 'rgba(8,145,178,0.15)', border: 'rgba(8,145,178,0.3)' },
};

const THEME_VARS = {
  dark:   { bg: '#0a0a0f', secondary: '#111118', card: '#16161f', hover: '#1e1e2a', input: '#13131a', text: '#f0f0f8', textSec: '#8888a8', textMuted: '#55556a', border: 'rgba(255,255,255,0.06)' },
  amoled: { bg: '#000000', secondary: '#0a0a0a', card: '#111111', hover: '#1a1a1a', input: '#080808', text: '#ffffff',  textSec: '#888899', textMuted: '#444455', border: 'rgba(255,255,255,0.05)' },
  light:  { bg: '#f5f5fa', secondary: '#ffffff',  card: '#ebebf5', hover: '#e0e0ee', input: '#f0f0f8', text: '#111118', textSec: '#555566', textMuted: '#999aaa', border: 'rgba(0,0,0,0.08)' },
  glass:  { bg: 'transparent', secondary: 'rgba(255,255,255,0.05)', card: 'rgba(255,255,255,0.07)', hover: 'rgba(255,255,255,0.1)', input: 'rgba(255,255,255,0.05)', text: '#f0f0f8', textSec: '#aaaacc', textMuted: '#666688', border: 'rgba(255,255,255,0.15)' },
};

const FONT_FAMILIES = {
  default: "'DM Sans', sans-serif",
  mono:    "'Courier New', monospace",
  serif:   "'Georgia', serif",
  rounded: "'Syne', sans-serif",
};

const FONT_SIZES = { small: '13px', medium: '15px', large: '17px' };

const GLASS_BLUR = { light: '8px', medium: '16px', strong: '28px' };

function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function applySettings(settings) {
  const root = document.documentElement;
  const t = THEME_VARS[settings.theme] || THEME_VARS.dark;
  const fs = FONT_SIZES[settings.fontSize] || '15px';
  const ff = FONT_FAMILIES[settings.fontFamily || 'default'];

  // Акцент
  let a;
  if (settings.accent === 'custom' && settings.customColor) {
    const c = settings.customColor;
    a = { accent: c, light: c, dim: hexToRgba(c, 0.15), border: hexToRgba(c, 0.3) };
  } else {
    a = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.violet;
  }

  root.style.setProperty('--bg-primary',    t.bg);
  root.style.setProperty('--bg-secondary',  t.secondary);
  root.style.setProperty('--bg-card',       t.card);
  root.style.setProperty('--bg-hover',      t.hover);
  root.style.setProperty('--bg-input',      t.input);
  root.style.setProperty('--text-primary',  t.text);
  root.style.setProperty('--text-secondary',t.textSec);
  root.style.setProperty('--text-muted',    t.textMuted);
  root.style.setProperty('--border',        t.border);
  root.style.setProperty('--accent',        a.accent);
  root.style.setProperty('--accent-light',  a.light);
  root.style.setProperty('--accent-dim',    a.dim);
  root.style.setProperty('--accent-border', a.border);
  root.style.setProperty('--font-size',     fs);
  root.style.setProperty('--font-body',     ff);
  document.body.style.fontSize = fs;
  document.body.style.fontFamily = ff;

  // Жидкое стекло
  if (settings.theme === 'glass') {
    const blur = GLASS_BLUR[settings.glassStrength || 'medium'];
    document.body.style.background = 'linear-gradient(135deg, #1a0a2e 0%, #0a0a1f 40%, #0d1a2e 100%)';
    root.style.setProperty('--glass-blur', blur);
    root.style.setProperty('--glass-border', 'rgba(255,255,255,0.18)');
  } else {
    document.body.style.background = '';
    root.style.setProperty('--glass-blur', '0px');
  }
}

const DEFAULT_SETTINGS = { theme: 'dark', accent: 'violet', fontSize: 'medium', fontFamily: 'default', glassStrength: 'medium', customColor: null };

function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('elyon_settings')) }; }
  catch { return DEFAULT_SETTINGS; }
}

export default function App() {
  const { user, userId, haptic, isFullscreen, toggleFullscreen } = useTelegram();
  const { chats, activeChat, activeChatId, setActiveChatId, createChat, deleteChat, sendMessage, setModel, loading } = useChats(userId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screen, setScreen] = useState('chat');
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    applySettings(settings);
    try { localStorage.setItem('elyon_settings', JSON.stringify(settings)); } catch {}
  }, [settings]);

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
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
          onCreate={() => { haptic('medium'); createChat(); setSidebarOpen(false); }}
          onDelete={deleteChat}
          onClose={() => setSidebarOpen(false)}
          onProfile={() => { setSidebarOpen(false); setScreen('profile'); }}
          onSettings={() => { setSidebarOpen(false); setScreen('settings'); }}
          user={user}
        />
      </div>

      <ChatView
        chat={activeChat}
        loading={loading}
        onSend={(text, fileData, fileBlob) => { haptic('light'); sendMessage(text, fileData, fileBlob); }}
        onMenuOpen={() => { haptic('light'); setSidebarOpen(true); }}
        onModelChange={(model) => { haptic('light'); setModel(model); }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {screen === 'profile' && (
        <Profile userId={userId} onClose={() => setScreen('chat')} />
      )}
      {screen === 'settings' && (
        <Settings settings={settings} onChange={setSettings} onClose={() => setScreen('chat')} />
      )}
    </div>
  );
}
