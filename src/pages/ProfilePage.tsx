import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Profile { id: string; email: string; createdAt: string }

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/auth/profile')
      .then(r => setProfile(r.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleDelete = async () => {
    try { await api.delete('/auth/account'); } catch {}
    localStorage.removeItem('access_token');
    navigate('/');
  };

  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, display: 'inline-block' }} />
        <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>Загружаем профиль...</p>
      </div>
    </div>
  );

  const joinDate = new Date(profile.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-logo">
          <div className="logo-icon" style={{ width: 30, height: 30, fontSize: 15 }}>⚡</div>
          <span>AuthApp</span>
        </div>
        <div className="menu-wrap" ref={menuRef}>
          <button className="menu-trigger" onClick={() => setMenuOpen(v => !v)} title="Меню">
            ···
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <button className="menu-item" onClick={handleLogout}>
                <span>🚪</span> Выйти из аккаунта
              </button>
              <button className="menu-item menu-item-danger" onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}>
                <span>🗑️</span> Удалить аккаунт
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-banner" />
        <div className="profile-body">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {profile.email[0].toUpperCase()}
            </div>
          </div>

          <div className="profile-name">{profile.email.split('@')[0]}</div>
          <div className="profile-meta">{profile.email}</div>

          <div className="profile-stat-row">
            <div className="profile-stat">
              <div className="profile-stat-label">Дата регистрации</div>
              <div className="profile-stat-value">{joinDate}</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-label">Статус</div>
              <div className="profile-stat-value" style={{ color: 'var(--green)' }}>● Активен</div>
            </div>
          </div>

          <div className="profile-stat" style={{ marginBottom: 0 }}>
            <div className="profile-stat-label">ID аккаунта</div>
            <div className="profile-stat-value" style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 400 }}>
              {profile.id}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      {confirmDelete && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(false); }}>
          <div className="dialog">
            <div className="dialog-icon">🗑️</div>
            <h3>Удалить аккаунт?</h3>
            <p>
              Аккаунт будет деактивирован, но не удалён навсегда.
              Вы сможете восстановить его через страницу восстановления.
            </p>
            <div className="dialog-btns">
              <button className="btn-cancel" onClick={() => setConfirmDelete(false)}>Отмена</button>
              <button className="btn-danger" onClick={handleDelete}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
