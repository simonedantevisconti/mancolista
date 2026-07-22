import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/header.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, authLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  return (
    <header className="site-header">
      <NavLink to="/" className="logo">
        <span className="logo-mark">M</span>
        <span>MancoLista</span>
      </NavLink>

      <nav className="main-nav">
        <NavLink to="/">Homepage</NavLink>
        <NavLink to="/le-mie-collezioni">Le mie collezioni</NavLink>

        {!authLoading && !user && <NavLink to="/login">Login</NavLink>}

        {!authLoading && user && (
          <>
            <span className="user-email">{user.email}</span>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
