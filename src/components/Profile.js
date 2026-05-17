import React, { useEffect, useState } from 'react';
import './Profile.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://worker-production-b2a1.up.railway.app';

export default function Profile({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetch(`${BACKEND_URL}/api/user/${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  const refLink = user ? `https://t.me/Elyon_by_unkony_bot?start=${userId}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
  };

  if (loading) return (
    <div className="profile-screen">
      <div className="profile-loading">
        <div className="spinner"/>
        <span>Loading...</span>
      </div>
    </div>
  );

  if (!user || user.error) return (
    <div className="profile-screen">
      <div className="profile-header">
        <button className="profile-back" onClick={onClose}>←</button>
        <h2>Profile</h2>
      </div>
      <div className="profile-empty">Open in Telegram to see your profile</div>
    </div>
  );

  const subLabel = user.sub_type === 'none' ? '❌ No subscription'
    : user.sub_type === 'forever' ? '♾️ Forever'
    : user.sub_type === 'month' ? `✅ 30 days (until ${user.sub_until})`
    : `✅ 6 months (until ${user.sub_until})`;

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <button className="profile-back" onClick={onClose}>←</button>
        <h2>Personal Account</h2>
      </div>

      <div className="profile-avatar">
        <div className="avatar-circle">
          {(user.username || 'U')[0].toUpperCase()}
        </div>
        <div className="avatar-name">@{user.username || 'user'}</div>
        <div className="avatar-role">{user.role === 'owner' ? '👑 Owner' : '👤 User'}</div>
      </div>

      <div className="profile-cards">
        <div className="profile-card">
          <div className="card-label">Subscription</div>
          <div className="card-value">{subLabel}</div>
        </div>

        <div className="profile-row">
          <div className="profile-card half">
            <div className="card-label">🪙 Coins</div>
            <div className="card-value big">{user.balance}</div>
          </div>
          <div className="profile-card half">
            <div className="card-label">👥 Referrals</div>
            <div className="card-value big">{user.referrals}</div>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-label">🔗 Referral link</div>
          <div className="ref-link-row">
            <div className="ref-link">{refLink}</div>
            <button className="copy-btn" onClick={copyLink}>Copy</button>
          </div>
          <div className="card-hint">+10 coins for each friend who joins</div>
        </div>

        <div className="profile-card">
          <div className="card-label">Current model</div>
          <div className="card-value">
            {user.ai_model === 'gemini' ? '⭐ Elyon Nova' : '🆓 Elyon Core'}
          </div>
        </div>
      </div>
    </div>
  );
}
