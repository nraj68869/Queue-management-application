import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-mark">#</span>
          Counter
        </Link>
        {user && (
          <div className="navbar__right">
            <span className="navbar__user">{user.name}</span>
            <button className="btn btn--ghost" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
