import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-badge">
        <span>✦</span> Безопасная авторизация с JWT
      </div>

      <h1 className="home-title">
        Добро<br />
        <span className="grad">пожаловать</span>
      </h1>

      <p className="home-sub">
        Создайте аккаунт за секунды или войдите в существующий. Ваши данные надёжно защищены.
      </p>

      <div className="home-buttons">
        <Link to="/register" className="home-btn home-btn-primary">
          Зарегистрироваться
        </Link>
        <Link to="/login" className="home-btn home-btn-secondary">
          Войти в аккаунт
        </Link>
        <Link to="/restore" className="home-btn home-btn-ghost">
          Восстановить аккаунт
        </Link>
      </div>
    </div>
  );
}
