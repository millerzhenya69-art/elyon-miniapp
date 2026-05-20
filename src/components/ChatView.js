import React, { useEffect, useRef, useState } from 'react';
import './ChatView.css';

function TypingDots() {
  return (
    <div className="message assistant">
      <div className="msg-bubble typing">
        <span/><span/><span/>
      </div>
    </div>
  );
}

function Message({ msg }) {
  return (
    <div className={`message ${msg.role}`} style={{ animation: 'messagePop 0.25s ease' }}>
      {msg.role === 'assistant' && <div className="msg-avatar">E</div>}
      <div className="msg-bubble">
        {msg.file && (
          <div className="msg-file-preview">
            {msg.file.type.startsWith('image/') ? (
              <img src={msg.file.url} alt="attachment" className="msg-image"/>
            ) : (
              <div className="msg-file-badge">📎 {msg.file.name}</div>
            )}
          </div>
        )}
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatView({ chat, loading, onSend, onMenuOpen, onModelChange, isFullscreen, onToggleFullscreen }) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !file) || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (file) {
      setFileUploading(true);
      const fileData = { name: file.name, type: file.type, url: URL.createObjectURL(file) };
      setFile(null);
      await onSend(text || 'Проанализируй этот файл', fileData, file);
      setFileUploading(false);
    } else {
      onSend(text);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
    e.target.value = '';
  };

  const removeFile = () => setFile(null);

  const isEmpty = chat.messages.length === 0;

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button className="menu-btn" onClick={onMenuOpen}>
          <span/><span/><span/>
        </button>
        <div className="chat-header-center">
          <div className="header-logo">E</div>
          <span className="header-title">Elyon AI</span>
        </div>
        {onToggleFullscreen && (
          <button className="fullscreen-btn" onClick={onToggleFullscreen}>
            {isFullscreen ? '⊡' : '⊞'}
          </button>
        )}
        <div className="model-toggle">
          <button className={`model-btn ${chat.model === 'gpt' ? 'active' : ''}`}
            onClick={() => onModelChange('gpt')}>Core</button>
          <button className={`model-btn ${chat.model === 'gemini' ? 'active' : ''}`}
            onClick={() => onModelChange('gemini')}>Nova</button>
        </div>
      </div>

      <div className="messages-area">
        {isEmpty && (
          <div className="empty-state">
            <div className="empty-logo">E</div>
            <h2 className="empty-title">Elyon AI</h2>
            <p className="empty-sub">
              {chat.model === 'gpt' ? '🆓 Elyon Core — fast & free' : '⭐ Elyon Nova — deep thinking'}
            </p>
            <div className="empty-hints">
              <div className="hint">💡 Ask me anything</div>
              <div className="hint">✍️ Write, analyze, code</div>
              <div className="hint">📎 Send files & images</div>
            </div>
          </div>
        )}
        {chat.messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {(loading || fileUploading) && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      <div className="input-area">
        {file && (
          <div className="file-preview-bar">
            <div className="file-preview-info">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt="preview" className="file-thumb"/>
              ) : (
                <span className="file-icon">📎</span>
              )}
              <span className="file-name">{file.name}</span>
            </div>
            <button className="file-remove" onClick={removeFile}>✕</button>
          </div>
        )}
        <div className="input-box">
          <button className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach file">
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*,.pdf,.txt,.py,.js,.ts,.cpp,.c,.java,.go,.rs,.html,.css,.json,.csv,.md,.sql,.yaml,.yml"
          />
          <textarea
            ref={textareaRef}
            className="input-field"
            placeholder={file ? "Add a message or send as is..." : "Message Elyon..."}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className={`send-btn ${(input.trim() || file) && !loading ? 'ready' : ''}`}
            onClick={handleSend}
            disabled={(!input.trim() && !file) || loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="input-hint">Elyon AI · {chat.model === 'gpt' ? 'Core' : 'Nova'}</div>
      </div>
    </div>
  );
}
