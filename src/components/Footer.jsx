import { NavLink } from "react-router-dom";
import "../styles/footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__mark">M</span>

          <div>
            <strong>MancoLista</strong>
            <p>La tua collezione, sempre sotto controllo.</p>
          </div>
        </div>

        <nav className="site-footer__links" aria-label="Link legali">
          <NavLink to="/privacy">Privacy</NavLink>
          <NavLink to="/cookie">Cookie</NavLink>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <p>© {year} MancoLista</p>

        <p>
          Developed by{" "}
          <a
            href="https://simonevisconti.site/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Simone Visconti
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
