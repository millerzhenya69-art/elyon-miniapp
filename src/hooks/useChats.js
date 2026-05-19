import { useState, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://elyon-bot.onrender.com';

export function useChats(userId) {
  const [chats, setChats] = useState([
    { id: 'default', title: 'New chat', messages: [], model: 'gpt', createdAt: Date.now() }
  ]);
  const [activeChatId, setActiveChatId] = useState('default');
  const [loading, setLoading] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const createChat = useCallback(() => {
    const id = `chat_${Date.now()}`;
    const newChat = { id, title: 'New chat', messages: [], model: activeChat?.model || 'gpt', createdAt: Date.now() };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(id);
    return id;
  }, [activeChat]);

  const deleteChat = useCallback((chatId) => {
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== chatId);
      if (remaining.length === 0) {
        const fallback = { id: 'default', title: 'New chat', messages: [], model: 'gpt', createdAt: Date.now() };
        setActiveChatId('default');
        return [fallback];
      }
      if (activeChatId === chatId) setActiveChatId(remaining[0].id);
      return remaining;
    });
  }, [activeChatId]);

  const sendMessage = useCallback(async (text, fileData = null, fileBlob = null) => {
    if ((!text.trim() && !fileBlob) || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      file: fileData,
      ts: Date.now()
    };

    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      const title = c.messages.length === 0 ? (text || fileData?.name || 'File').slice(0, 32) : c.title;
      return { ...c, title, messages: [...c.messages, userMsg] };
    }));

    setLoading(true);

    try {
      let reply;

      if (fileBlob) {
        // Отправка файла
        const formData = new FormData();
        formData.append('file', fileBlob, fileData.name);
        formData.append('user_id', String(userId));
        formData.append('model', activeChat.model);
        formData.append('prompt', text || 'Проанализируй этот файл');

        const history = activeChat.messages.map(m => ({ role: m.role, content: m.content }));
        formData.append('history', JSON.stringify(history));

        const res = await fetch(`${BACKEND_URL}/api/file`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        reply = data.reply || data.error || 'No response.';
      } else {
        // Обычное текстовое сообщение
        const history = activeChat.messages.map(m => ({ role: m.role, content: m.content }));
        history.push({ role: 'user', content: text });

        const res = await fetch(`${BACKEND_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            model: activeChat.model,
            messages: history
          })
        });
        const data = await res.json();
        reply = data.reply || data.error || 'No response.';
      }

      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: reply, ts: Date.now() };
      setChats(prev => prev.map(c =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, aiMsg] } : c
      ));
    } catch (err) {
      const errMsg = { id: Date.now() + 1, role: 'assistant', content: '❌ Connection error. Try again.', ts: Date.now() };
      setChats(prev => prev.map(c =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, errMsg] } : c
      ));
    } finally {
      setLoading(false);
    }
  }, [activeChatId, activeChat, loading, userId]);

  const setModel = useCallback((model) => {
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, model } : c));
  }, [activeChatId]);

  return { chats, activeChat, activeChatId, setActiveChatId, createChat, deleteChat, sendMessage, setModel, loading };
}
