import { NavLink } from "react-router-dom";
import "../styles/header.css";

const Header = () => {
  return (
    <header className="site-header">
      <NavLink to="/" className="logo">
        <span className="logo-mark">M</span>
        <span>MancoLista</span>
      </NavLink>

      <nav className="main-nav">
        <NavLink to="/">Homepage</NavLink>
        <NavLink to="/le-mie-collezioni">Le mie collezioni</NavLink>
        <NavLink to="/login">Login</NavLink>
      </nav>
    </header>
  );
};

export default Header;
