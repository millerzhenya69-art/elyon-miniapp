import { useEffect } from 'react';

const tg = window.Telegram?.WebApp;

export function useTelegram() {
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Fullscreen API (Telegram 8.0+)
      if (tg.requestFullscreen) {
        tg.requestFullscreen();
      }
      tg.setHeaderColor('#0a0a0f');
      tg.setBackgroundColor('#0a0a0f');
    }
  }, []);

  return {
    tg,
    user: tg?.initDataUnsafe?.user || null,
    userId: tg?.initDataUnsafe?.user?.id || null,
    username: tg?.initDataUnsafe?.user?.username || null,
    firstName: tg?.initDataUnsafe?.user?.first_name || 'User',
    initData: tg?.initData || '',
    close: () => tg?.close(),
    haptic: (type = 'light') => tg?.HapticFeedback?.impactOccurred(type),
  };
}
