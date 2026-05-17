import React from 'react';
import './Settings.css';

const THEMES = [
  { id: 'dark',   label: 'Dark',    bg: '#0a0a0f' },
  { id: 'amoled', label: 'AMOLED',  bg: '#000000' },
  { id: 'light',  label: 'Light',   bg: '#f5f5fa' },
];

const FONTS = [
  { id: 'small',  label: 'S', size: '13px' },
  { id: 'medium', label: 'M', size: '15px' },
  { id: 'large',  label: 'L', size: '17px' },
];

const ACCENTS = [
  { id: 'violet', label: 'Violet', color: '#7c3aed' },
  { id: 'blue',   label: 'Blue',   color: '#2563eb' },
  { id: 'pink',   label: 'Pink',   color: '#db2777' },
  { id: 'green',  label: 'Green',  color: '#059669' },
];

export default function Settings({ settings, onChange, onClose }) {
  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button className="settings-back" onClick={onClose}>←</button>
        <h2>Customization</h2>
      </div>

      <div className="settings-body">
        <div className="settings-section">
          <div className="section-title">Theme</div>
          <div className="theme-options">
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`theme-btn ${settings.theme === t.id ? 'active' : ''}`}
                onClick={() => onChange({ ...settings, theme: t.id })}
              >
                <div className="theme-preview" style={{ background: t.bg }}/>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">Accent color</div>
          <div className="accent-options">
            {ACCENTS.map(a => (
              <button
                key={a.id}
                className={`accent-btn ${settings.accent === a.id ? 'active' : ''}`}
                style={{ '--btn-color': a.color }}
                onClick={() => onChange({ ...settings, accent: a.id })}
              >
                <div className="accent-dot" style={{ background: a.color }}/>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">Font size</div>
          <div className="font-options">
            {FONTS.map(f => (
              <button
                key={f.id}
                className={`font-btn ${settings.fontSize === f.id ? 'active' : ''}`}
                onClick={() => onChange({ ...settings, fontSize: f.id })}
              >
                <span style={{ fontSize: f.size }}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">Preview</div>
          <div className="preview-bubble">
            Hello! I'm Elyon AI — how can I help you today?
          </div>
        </div>
      </div>
    </div>
  );
}
