import { Link } from "react-router-dom";
import "../styles/not-found.css";

const NotFound = () => {
  return (
    <section className="not-found-page">
      <div className="not-found-card">
        <p className="not-found-code">404</p>
        <p className="eyebrow">Pagina non trovata</p>

        <h1>Questa pagina non esiste</h1>

        <p>
          L’indirizzo potrebbe essere errato oppure la pagina potrebbe essere
          stata spostata.
        </p>

        <Link className="not-found-button" to="/">
          Torna alla homepage
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
