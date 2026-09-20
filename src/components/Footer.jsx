import { NavLink } from "react-router-dom";
import "../styles/footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <strong>MancoLista</strong>
          <span>La tua collezione, sempre sotto controllo.</span>
        </div>

        <nav className="site-footer__links" aria-label="Link legali">
          <NavLink to="/privacy">Privacy</NavLink>
          <NavLink to="/cookie">Cookie</NavLink>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <span>© {year} MancoLista</span>

        <span>
          Developed by{" "}
          <a
            href="https://simonevisconti.site/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Simone Visconti
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
