import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function RestorePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    if (!email || !password) { setError('Заполните все поля'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const { data } = await api.post('/auth/restore', { email, password });
      localStorage.setItem('access_token', data.accessToken);
      setSuccess('Аккаунт восстановлен! Переходим...');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Аккаунт не найден или пароль неверный');
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

        <h2 className="card-title">Восстановление</h2>
        <p className="card-sub">
          Введите данные удалённого аккаунта — мы его восстановим
        </p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <span>✅</span> {success}
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRestore()}
          />
        </div>

        <div className="field">
          <label>Пароль</label>
          <input
            type="password"
            placeholder="Пароль от аккаунта"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRestore()}
          />
        </div>

        <button className="btn btn-green" onClick={handleRestore} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Восстанавливаем...' : 'Восстановить аккаунт'}
        </button>

        <div className="link-row">
          <Link to="/login" className="link link-accent">← Назад к входу</Link>
          <Link to="/" className="link">На главную</Link>
        </div>
      </div>
    </div>
  );
}
