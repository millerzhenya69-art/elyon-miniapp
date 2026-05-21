import React, { useEffect, useState } from 'react';
import './Profile.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://elyon-bot.onrender.com';
const BOT_USERNAME = 'Elyon_by_unkony_bot';

export default function Profile({ userId, onClose }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('main'); // main | pay | history

  const loadUser = () => {
    if (!userId) { setLoading(false); return; }
    fetch(`${BACKEND_URL}/api/user/${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUser(); }, [userId]);

  const refLink = user ? `https://t.me/${BOT_USERNAME}?start=${userId}` : '';

  const copyLink = () => {
    navigator.clipboard?.writeText(refLink).catch(() => {});
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Ссылка скопирована!');
    }
  };

  // ── Оплата через Telegram Stars ───────────────────────────────────────
  const openStarsPayment = (type) => {
    if (!window.Telegram?.WebApp) {
      alert('Открой в Telegram для оплаты.');
      return;
    }
    // Открываем бота с нужным параметром — он запустит инвойс
    window.Telegram.WebApp.openTelegramLink(
      `https://t.me/${BOT_USERNAME}?start=pay_${type}`
    );
  };

  // ── Beta-tester через Stars ───────────────────────────────────────────
  const buyBetaTester = () => {
    if (!window.Telegram?.WebApp) {
      alert('Открой в Telegram для оплаты.');
      return;
    }
    window.Telegram.WebApp.openTelegramLink(
      `https://t.me/${BOT_USERNAME}`
    );
    window.Telegram.WebApp.showAlert(
      'Перейди в бот и нажми кнопку "Личный кабинет" → "Купить роль Beta-Tester за 50 звёзд"'
    );
  };

  // ── Загрузка ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="profile-screen">
      <div className="profile-loading">
        <div className="spinner"/>
        <span>Загрузка...</span>
      </div>
    </div>
  );

  if (!user || user.error) return (
    <div className="profile-screen">
      <div className="profile-header">
        <button className="profile-back" onClick={onClose}>←</button>
        <h2>Профиль</h2>
      </div>
      <div className="profile-empty">Открой в Telegram чтобы увидеть профиль</div>
    </div>
  );

  const subLabel =
    user.sub_type === 'none'     ? '❌ Нет подписки'
    : user.sub_type === 'forever' ? '♾️ Навсегда'
    : user.sub_type === 'month'   ? `✅ 30 дней (до ${user.sub_until})`
    : user.sub_type === 'halfyear'? `✅ 6 месяцев (до ${user.sub_until})`
    : `✅ ${user.sub_type} (до ${user.sub_until})`;

  const roleEmoji =
    user.role === 'owner'       ? '👑' :
    user.role === 'beta-tester' ? '🔬' :
    user.role === 'sponsor'     ? '💎' : '👤';

  const PLANS = [
    { key: 'month',    label: '30 дней',    stars: 30,  rub: 50  },
    { key: 'halfyear', label: '6 месяцев',  stars: 60,  rub: 182 },
    { key: 'forever',  label: 'Навсегда',   stars: 120, rub: 429 },
  ];

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <button className="profile-back" onClick={onClose}>←</button>
        <h2>Личный кабинет</h2>
      </div>

      {/* Аватар */}
      <div className="profile-avatar">
        <div className="avatar-circle">
          {(user.username || 'U')[0].toUpperCase()}
        </div>
        <div className="avatar-name">@{user.username || 'user'}</div>
        <div className="avatar-role">{roleEmoji} {user.role}</div>
      </div>

      {/* Табы */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${tab === 'main' ? 'active' : ''}`}
          onClick={() => setTab('main')}
        >Профиль</button>
        <button
          className={`profile-tab ${tab === 'pay' ? 'active' : ''}`}
          onClick={() => setTab('pay')}
        >Оплата</button>
        <button
          className={`profile-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >История</button>
      </div>

      {/* ── Вкладка: Профиль ── */}
      {tab === 'main' && (
        <div className="profile-cards">
          <div className="profile-card">
            <div className="card-label">Подписка</div>
            <div className="card-value">{subLabel}</div>
          </div>

          <div className="profile-row">
            <div className="profile-card half">
              <div className="card-label">🪙 Монеты</div>
              <div className="card-value big">{user.balance}</div>
            </div>
            <div className="profile-card half">
              <div className="card-label">👥 Рефералы</div>
              <div className="card-value big">{user.referrals}</div>
            </div>
          </div>

          <div className="profile-card">
            <div className="card-label">🔗 Реферальная ссылка</div>
            <div className="ref-link-row">
              <div className="ref-link">{refLink}</div>
              <button className="copy-btn" onClick={copyLink}>Копировать</button>
            </div>
            <div className="card-hint">+10 монет за каждого приглашённого друга</div>
          </div>

          <div className="profile-card">
            <div className="card-label">Текущая модель</div>
            <div className="card-value">
              {user.ai_model === 'gemini' ? '⭐ Elyon Nova' : '🆓 Elyon Core'}
            </div>
          </div>

          {/* Кнопка beta-tester — только если не owner и не beta-tester */}
          {user.role !== 'owner' && user.role !== 'beta-tester' && (
            <button className="beta-tester-btn" onClick={buyBetaTester}>
              🔬 Купить роль Beta-Tester за 50 ⭐
            </button>
          )}
        </div>
      )}

      {/* ── Вкладка: Оплата ── */}
      {tab === 'pay' && (
        <div className="profile-cards">
          <div className="profile-card">
            <div className="card-label">⭐ Оплата звёздами Telegram</div>
            <div className="pay-plans">
              {PLANS.map(p => (
                <button
                  key={p.key}
                  className="pay-plan-btn"
                  onClick={() => openStarsPayment(p.key)}
                >
                  <span className="plan-label">{p.label}</span>
                  <span className="plan-price">{p.stars} ⭐</span>
                </button>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <div className="card-label-row">
              <span className="card-label">🎁 Оплата подарком</span>
              <span className="tag-test">TEST</span>
            </div>
            <div className="card-hint" style={{marginBottom:'10px'}}>
              Отправь боту подарок на соответствующую сумму звёзд — администратор активирует подписку вручную.
            </div>
            <div className="pay-plans">
              {PLANS.map(p => (
                <button
                  key={p.key}
                  className="pay-plan-btn pay-plan-gift"
                  onClick={() => {
                    if (window.Telegram?.WebApp) {
                      window.Telegram.WebApp.openTelegramLink(
                        `https://t.me/${BOT_USERNAME}`
                      );
                      window.Telegram.WebApp.showAlert(
                        `Отправь боту подарок на ${p.stars} звёзд для тарифа "${p.label}"`
                      );
                    }
                  }}
                >
                  <span className="plan-label">{p.label}</span>
                  <span className="plan-price">{p.stars} ⭐</span>
                </button>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <div className="card-label">🪙 Монеты</div>
            <div className="card-value big" style={{marginBottom:'8px'}}>{user.balance}</div>
            <div className="card-hint">
              Монеты можно потратить на подписку в боте через кнопку ⭐ Elyon Nova
            </div>
          </div>
        </div>
      )}

      {/* ── Вкладка: История покупок ── */}
      {tab === 'history' && (
        <div className="profile-cards">
          {(!user.purchase_history || user.purchase_history.length === 0) ? (
            <div className="profile-empty">Покупок пока нет</div>
          ) : (
            user.purchase_history.map((p, i) => (
              <div className="profile-card purchase-item" key={i}>
                <div className="purchase-top">
                  <span className="purchase-label">{p[1]}</span>
                  <span className="purchase-status">{p[4] === 'completed' ? '✅' : '⏳'}</span>
                </div>
                <div className="purchase-meta">
                  {p[2]} · {p[3]} · {p[5]}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
