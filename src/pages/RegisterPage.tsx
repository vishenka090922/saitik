import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('Заполните все поля'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', { email, password });
      localStorage.setItem('access_token', data.accessToken);
      navigate('/profile');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка при регистрации');
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

        <h2 className="card-title">Создать аккаунт</h2>
        <p className="card-sub">Введите данные для регистрации</p>

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
            placeholder="Минимум 6 символов"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
        </button>

        <div className="link-row">
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" className="link link-accent">Войти</Link>
          </span>
          <Link to="/" className="link">← На главную</Link>
        </div>
      </div>
    </div>
  );
}
