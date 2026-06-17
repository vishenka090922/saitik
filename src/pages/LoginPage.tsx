import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('Заполните все поля'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', data.accessToken);
      navigate('/profile');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">AuthApp</span>
        </div>

        <h2 className="card-title">Добро пожаловать</h2>
        <p className="card-sub">Войдите в свой аккаунт</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="field">
          <label>Пароль</label>
          <input
            type="password"
            placeholder="Ваш пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Входим...' : 'Войти'}
        </button>

        <div className="divider" />

        <div className="link-row">
          <Link to="/restore" className="link link-accent">
            Забыл пароль / восстановить аккаунт
          </Link>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Нет аккаунта?{' '}
            <Link to="/register" className="link link-accent">Создать</Link>
          </span>
          <Link to="/" className="link">← На главную</Link>
        </div>
      </div>
    </div>
  );
}
