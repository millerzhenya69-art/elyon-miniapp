import { useState, useCallback, useEffect, useRef } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://unkony-elyon-bot.hf.space';

// Сохраняем чат на сервер (дебаунс 800ms)
async function persistChat(userId, chat) {
  if (!userId) return;
  try {
    await fetch(`${BACKEND_URL}/api/chats/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:  chat.id,
        title:    chat.title,
        model:    chat.model,
        messages: chat.messages,
      }),
    });
  } catch (e) {
    console.warn('Chat persist error:', e);
  }
}

async function deletePersistedChat(userId, chatId) {
  if (!userId) return;
  try {
    await fetch(`${BACKEND_URL}/api/chats/${userId}/${chatId}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Chat delete error:', e);
  }
}

const DEFAULT_CHAT = { id: 'default', title: 'New chat', messages: [], model: 'gpt', createdAt: Date.now() };

export function useChats(userId) {

  const [chats, setChats] = useState([DEFAULT_CHAT]);
  const [activeChatId, setActiveChatId] = useState('default');
  const [loading, setLoading] = useState(false);
  const [chatsLoaded, setChatsLoaded] = useState(false);

  const saveTimers = useRef({});

  // ── Загружаем чаты с сервера при старте ──────────────────────────────
  useEffect(() => {
    if (!userId || chatsLoaded) return;

    fetch(`${BACKEND_URL}/api/chats/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.chats && data.chats.length > 0) {
          // Преобразуем данные с сервера в нужный формат
          const loaded = data.chats.map(c => ({
            id:        c.id,
            title:     c.title || 'New chat',
            model:     c.model || 'gpt',
            messages:  Array.isArray(c.messages) ? c.messages : [],
            createdAt: c.createdAt || Date.now(),
          }));
          setChats(loaded);
          setActiveChatId(loaded[0].id);
        }
        setChatsLoaded(true);
      })
      .catch(() => {
        setChatsLoaded(true);
      });
  }, [userId, chatsLoaded]);

  // ── Дебаунсированное сохранение чата ─────────────────────────────────
  const scheduleSave = useCallback((chat) => {
    if (!userId) return;
    if (saveTimers.current[chat.id]) clearTimeout(saveTimers.current[chat.id]);
    saveTimers.current[chat.id] = setTimeout(() => {
      persistChat(userId, chat);
    }, 800);
  }, [userId]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // ── Создать новый чат ─────────────────────────────────────────────────
  const createChat = useCallback(() => {
    const id      = `chat_${Date.now()}`;
    const newChat = {
      id,
      title:     'New chat',
      messages:  [],
      model:     activeChat?.model || 'gpt',
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(id);
    if (userId) persistChat(userId, newChat);
    return id;
  }, [activeChat, userId]);

  // ── Удалить чат ───────────────────────────────────────────────────────
  const deleteChat = useCallback((chatId) => {
    deletePersistedChat(userId, chatId);
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== chatId);
      if (remaining.length === 0) {
        const fallback = { ...DEFAULT_CHAT, createdAt: Date.now() };
        setActiveChatId('default');
        if (userId) persistChat(userId, fallback);
        return [fallback];
      }
      if (activeChatId === chatId) setActiveChatId(remaining[0].id);
      return remaining;
    });
  }, [activeChatId, userId]);

  // ── Отправить сообщение ───────────────────────────────────────────────
  const sendMessage = useCallback(async (text, fileData = null, fileBlob = null) => {
    if ((!text.trim() && !fileBlob) || loading) return;

    const userMsg = {
      id:      Date.now(),
      role:    'user',
      content: text,
      file:    fileData,
      ts:      Date.now(),
    };

    // Добавляем сообщение пользователя и обновляем заголовок
    let updatedChat;
    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      const title = c.messages.length === 0
        ? (text || fileData?.name || 'File').slice(0, 32)
        : c.title;
      updatedChat = { ...c, title, messages: [...c.messages, userMsg] };
      return updatedChat;
    }));

    setLoading(true);

    try {
      let reply;

      if (fileBlob) {
        const formData = new FormData();
        formData.append('file', fileBlob, fileData.name);
        formData.append('user_id', String(userId));
        formData.append('model', activeChat.model);
        formData.append('prompt', text || 'Проанализируй этот файл');
        const history = activeChat.messages.map(m => ({ role: m.role, content: m.content }));
        formData.append('history', JSON.stringify(history));

        const res = await fetch(`${BACKEND_URL}/api/file`, { method: 'POST', body: formData });
        const data = await res.json();
        reply = data.reply || data.error || 'No response.';
      } else {
        const history = [
          ...activeChat.messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: text },
        ];

        const modelMap = { core: 'gpt', nova: 'nova', pro: 'pro', absolution: 'absolution', gpt: 'gpt', gemini: 'nova' };
        const apiModel = modelMap[activeChat.model] || 'gpt';

        const res = await fetch(`${BACKEND_URL}/api/chat`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            user_id:  userId,
            model:    apiModel,
            messages: history,
            chat_id:  activeChatId,
          }),
        });
        const data = await res.json();
        if (data.error === 'daily_limit') {
          reply = `Вы достигли дневного лимита сообщений (${data.limit}/${data.limit}).\nЛимит обновится в 00:00.`;
        } else {
          reply = data.reply || data.error || 'No response.';
        }
      }

      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: reply, ts: Date.now() };

      setChats(prev => prev.map(c => {
        if (c.id !== activeChatId) return c;
        const updated = { ...c, messages: [...c.messages, aiMsg] };
        scheduleSave(updated);
        return updated;
      }));

    } catch (err) {
      const errMsg = {
        id:      Date.now() + 1,
        role:    'assistant',
        content: 'Ошибка соединения. Попробуй ещё раз.',
        ts:      Date.now(),
      };
      setChats(prev => prev.map(c =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, errMsg] } : c
      ));
    } finally {
      setLoading(false);
    }
  }, [activeChatId, activeChat, loading, userId, scheduleSave]);

  // ── Сменить модель ────────────────────────────────────────────────────
  const setModel = useCallback((model) => {
    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      const updated = { ...c, model };
      scheduleSave(updated);
      return updated;
    }));
  }, [activeChatId, scheduleSave]);

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    deleteChat,
    sendMessage,
    setModel,
    loading,
    chatsLoaded,
  };
}
