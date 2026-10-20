import { Link } from "react-router-dom";
import "../styles/legal.css";

const Cookie = () => (
  <section className="legal-page">
    <header className="legal-page__hero">
      <p className="eyebrow">Navigazione e tecnologie</p>
      <h1>Cookie <span>Policy</span></h1>
      <p className="legal-page__intro">
        Informazioni sui cookie e sulle tecnologie di memorizzazione utilizzate
        durante la navigazione e l'accesso a MancoLista.
      </p>
      <span className="legal-page__updated">Ultimo aggiornamento: 21 ottobre 2026</span>
    </header>

    <div className="legal-page__notice">
      <strong>In breve</strong>
      <p>MancoLista usa Firebase Authentication per gestire il login e
        tecnologie del browser per le funzionalità della web app installabile.
        Non è stato individuato nel codice esaminato un sistema di analytics
        pubblicitari o di profilazione; l'inventario effettivo va comunque
        verificato anche sul sito pubblicato.</p>
    </div>

    <div className="legal-page__sections">
      <article className="legal-page__card">
        <span className="legal-page__number">01 / COSA SONO</span>
        <h2>Cookie e memorie locali</h2>
        <p>I cookie sono piccoli dati salvati dal browser. Un'applicazione
          può usare anche localStorage, sessionStorage, IndexedDB e Cache Storage:
          sono tecnologie differenti dai cookie, ma possono contribuire al
          funzionamento del servizio e al mantenimento di informazioni sul dispositivo.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">02 / AUTENTICAZIONE</span>
        <h2>Accesso con email o Google</h2>
        <p>Firebase Authentication utilizza meccanismi di persistenza della
          sessione per riconoscere l'utente dopo l'accesso. Con l'opzione
          “Continua con Google” il browser comunica anche con i sistemi
          Google per completare l'autenticazione; Google può utilizzare
          cookie o altre tecnologie nell'ambito del proprio servizio.</p>
        <p>Puoi approfondire nelle <a href="https://policies.google.com/technologies/cookies?hl=it" target="_blank" rel="noopener noreferrer">informazioni sui cookie di Google</a>.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">03 / PWA E CACHE</span>
        <h2>Funzionamento della web app</h2>
        <p>MancoLista può memorizzare risorse statiche e immagini attraverso
          il Service Worker e Cache Storage per rendere più veloce la navigazione
          e supportare le funzioni dell'app installabile. Questi elementi
          non sono, di per sé, cookie pubblicitari.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">04 / FINALITÀ</span>
        <h2>Tecnologie tecniche e facoltative</h2>
        <p>Le tecnologie necessarie all'accesso, alla sicurezza e al
          funzionamento del servizio sono di natura tecnica. L'impiego
          futuro di analytics non essenziali, pubblicità o strumenti
          di profilazione richiederà una valutazione specifica e,
          quando previsto, un meccanismo di consenso preventivo.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">05 / CONTROLLO</span>
        <h2>Come gestire i dati nel browser</h2>
        <p>Puoi visualizzare o cancellare cookie, dati dei siti e cache dalle
          impostazioni del browser. Disabilitare o cancellare i dati di
          autenticazione potrebbe disconnetterti; rimuovere la cache della PWA
          potrebbe comportare il nuovo download delle risorse dell'app.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">06 / SERVIZI E AGGIORNAMENTI</span>
        <h2>Fornitori e variazioni</h2>
        <p>Per autenticazione e database MancoLista utilizza Firebase;
          per hosting e distribuzione Netlify. I cookie e gli strumenti
          tecnici effettivamente presenti possono variare in funzione del browser,
          dello stato di accesso e dei servizi attivati. Questa policy
          verrà aggiornata in caso di cambiamenti rilevanti.</p>
        <p>Per dettagli relativi ai dati personali, consulta la
          <Link to="/privacy"> Privacy Policy</Link>.</p>
      </article>
    </div>
    <nav className="legal-page__footer" aria-label="Informative">
      <Link to="/privacy">Leggi la Privacy Policy <span aria-hidden="true">→</span></Link>
      <Link to="/">Torna alla homepage <span aria-hidden="true">→</span></Link>
    </nav>
  </section>
);

export default Cookie;
