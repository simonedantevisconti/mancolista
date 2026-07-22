import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/header.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, authLoading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      navigate("/");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__top">
        <NavLink to="/" className="logo" onClick={closeMenu}>
          <span className="logo-mark">M</span>
          <span>MancoLista</span>
        </NavLink>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((currentValue) => !currentValue)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        id="main-navigation"
        className={`main-nav ${menuOpen ? "is-open" : ""}`}
      >
        <NavLink to="/" onClick={closeMenu}>
          Homepage
        </NavLink>

        <NavLink to="/le-mie-collezioni" onClick={closeMenu}>
          Le mie collezioni
        </NavLink>

        {!authLoading && !user && (
          <NavLink to="/login" onClick={closeMenu}>
            Login
          </NavLink>
        )}

        {!authLoading && user && (
          <>
            <span className="user-email" title={user.email}>
              {user.email}
            </span>

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
