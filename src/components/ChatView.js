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
      {msg.role === 'assistant' && (
        <div className="msg-avatar">E</div>
      )}
      <div className="msg-bubble">
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatView({ chat, loading, onSend, onMenuOpen, onModelChange }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, loading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSend(text);
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

  const isEmpty = chat.messages.length === 0;

  return (
    <div className="chat-view">
      {/* Header */}
      <div className="chat-header">
        <button className="menu-btn" onClick={onMenuOpen}>
          <span/><span/><span/>
        </button>
        <div className="chat-header-center">
          <div className="header-logo">E</div>
          <span className="header-title">Elyon AI</span>
        </div>
        <div className="model-toggle">
          <button
            className={`model-btn ${chat.model === 'gpt' ? 'active' : ''}`}
            onClick={() => onModelChange('gpt')}
          >Core</button>
          <button
            className={`model-btn ${chat.model === 'gemini' ? 'active' : ''}`}
            onClick={() => onModelChange('gemini')}
          >Nova</button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {isEmpty && (
          <div className="empty-state">
            <div className="empty-logo">E</div>
            <h2 className="empty-title">Elyon AI</h2>
            <p className="empty-sub">
              {chat.model === 'gpt'
                ? '🆓 Elyon Core — fast & free'
                : '⭐ Elyon Nova — deep thinking'}
            </p>
            <div className="empty-hints">
              <div className="hint">💡 Ask me anything</div>
              <div className="hint">✍️ Write, analyze, code</div>
              <div className="hint">🌐 Any language</div>
            </div>
          </div>
        )}
        {chat.messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <div className="input-box">
          <textarea
            ref={textareaRef}
            className="input-field"
            placeholder="Message Elyon..."
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className={`send-btn ${input.trim() && !loading ? 'ready' : ''}`}
            onClick={handleSend}
            disabled={!input.trim() || loading}
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
