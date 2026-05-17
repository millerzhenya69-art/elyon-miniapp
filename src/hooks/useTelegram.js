import { useEffect, useState, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

export function useTelegram() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#0a0a0f');
      tg.setBackgroundColor('#0a0a0f');

      // Слушаем события fullscreen
      if (tg.onEvent) {
        tg.onEvent('fullscreenChanged', () => {
          setIsFullscreen(!!tg.isFullscreen);
        });
      }
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!tg) return;
    if (tg.isFullscreen) {
      if (tg.exitFullscreen) tg.exitFullscreen();
      setIsFullscreen(false);
    } else {
      if (tg.requestFullscreen) tg.requestFullscreen();
      setIsFullscreen(true);
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
    isFullscreen,
    toggleFullscreen,
  };
}
