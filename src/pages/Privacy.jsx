import "../styles/legal.css";

const Privacy = () => {
  return (
    <section className="legal-page">
      <p className="eyebrow">Informativa</p>
      <h1>Privacy Policy</h1>
      <p className="legal-page__intro">
        In questa pagina trovi le informazioni essenziali sul trattamento dei
        dati personali all'interno di MancoLista.
      </p>

      <div className="legal-page__card">
        <h2>Dati trattati</h2>
        <p>
          MancoLista può trattare i dati necessari alla registrazione,
          all'autenticazione e al salvataggio delle collezioni associate
          all'account dell'utente.
        </p>

        <h2>Finalità</h2>
        <p>
          I dati vengono utilizzati esclusivamente per fornire le funzionalità
          del servizio, gestire l'accesso e mantenere sincronizzate le
          collezioni dell'utente.
        </p>

        <h2>Servizi di terze parti</h2>
        <p>
          L'applicazione può utilizzare servizi tecnici esterni necessari al
          funzionamento, come autenticazione, database, hosting e servizi API.
        </p>

        <h2>Contatti</h2>
        <p>
          Per richieste relative alla privacy puoi fare riferimento al
          responsabile del sito tramite i contatti disponibili su{" "}
          <a
            href="https://simonevisconti.site/"
            target="_blank"
            rel="noopener noreferrer"
          >
            simonevisconti.site
          </a>
          .
        </p>
      </div>
    </section>
  );
};

export default Privacy;
