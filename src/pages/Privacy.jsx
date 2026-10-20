import { Link } from "react-router-dom";
import "../styles/legal.css";

const Privacy = () => (
  <section className="legal-page">
    <header className="legal-page__hero">
      <p className="eyebrow">Trasparenza e dati personali</p>
      <h1>Privacy <span>Policy</span></h1>
      <p className="legal-page__intro">
        Come MancoLista utilizza i dati necessari per creare un account, salvare
        le collezioni e mantenere sicuro l’accesso al servizio.
      </p>
      <span className="legal-page__updated">Ultimo aggiornamento: 21 ottobre 2026</span>
    </header>

    <div className="legal-page__notice">
      <strong>In breve</strong>
      <p>Per registrarti puoi usare email e password oppure Google. Le carte possedute,
        le mancanti e le doppie sono associate al tuo account per ritrovare i tuoi progressi.</p>
    </div>

    <div className="legal-page__sections">
      <article className="legal-page__card">
        <span className="legal-page__number">01 / IDENTITÀ E CONTATTI</span>
        <h2>Titolare del trattamento</h2>
        <p>Il servizio è MancoLista, disponibile su <a href="https://mancolista.site/">mancolista.site</a>.
          Per richieste relative ai dati personali puoi utilizzare i riferimenti
          del gestore del progetto pubblicati su <a href="https://simonevisconti.site/" target="_blank" rel="noopener noreferrer">simonevisconti.site</a>.</p>
        <p>Le informazioni identificative complete e un recapito diretto del titolare
          devono essere confermati e integrati prima di considerare definitiva questa informativa.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">02 / DATI RACCOLTI</span>
        <h2>Quali dati trattiamo</h2>
        <ul>
          <li><strong>Registrazione email:</strong> indirizzo email, credenziali di accesso gestite da Firebase Authentication e identificativo univoco dell'account (UID).</li>
          <li><strong>Accesso con Google:</strong> email, nome visualizzato ed eventuale immagine profilo forniti dal provider, oltre all'UID e al metodo di autenticazione.</li>
          <li><strong>Profilo:</strong> nome utente scelto, nome visualizzato, provider e date tecniche di creazione/aggiornamento e di accesso.</li>
          <li><strong>Collezioni:</strong> carte contrassegnate come possedute, numero di doppie, serie, codici e progressi associati all'account.</li>
          <li><strong>Richieste:</strong> informazioni inviate quando suggerisci una nuova collezione e stato della richiesta.</li>
          <li><strong>Dati tecnici:</strong> informazioni di connessione e diagnostica trattate dai servizi di hosting e autenticazione, secondo le rispettive informative.</li>
        </ul>
        <p>La password è gestita dal sistema Firebase Authentication; MancoLista non la salva come testo nel documento del profilo Firestore.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">03 / FINALITÀ E BASI GIURIDICHE</span>
        <h2>Perché trattiamo i dati</h2>
        <p>Per creare e gestire l'account, autenticare gli accessi, salvare e sincronizzare
          le collezioni, mostrare i progressi, gestire le richieste e prevenire accessi
          non autorizzati. I trattamenti necessari a fornire il servizio si basano
          sull'esecuzione del rapporto con l'utente (art. 6, par. 1, lett. b GDPR);
          quelli necessari alla sicurezza possono basarsi sul legittimo interesse
          (art. 6, par. 1, lett. f GDPR), nei limiti applicabili.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">04 / FORNITORI</span>
        <h2>Servizi di terze parti</h2>
        <p><strong>Google Firebase:</strong> Firebase Authentication per login e registrazione,
          Cloud Firestore per profili, collezioni e richieste. L'accesso con Google
          comporta inoltre l'interazione con Google come fornitore dell'identità.</p>
        <p><strong>Netlify:</strong> pubblicazione e distribuzione dell'applicazione.
          Questi fornitori possono trattare dati tecnici necessari all'erogazione
          dei rispettivi servizi. Per dettagli su localizzazione dei dati, trasferimenti
          internazionali e garanzie applicabili occorre verificare la configurazione
          effettiva dei servizi e i relativi accordi.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">05 / CONSERVAZIONE</span>
        <h2>Per quanto tempo</h2>
        <p>I dati di profilo e delle collezioni sono conservati finché l'account
          rimane attivo o finché sono necessari al servizio. I dati tecnici
          gestiti dai fornitori possono avere tempi di conservazione differenti,
          definiti dalle loro configurazioni e informative.</p>
        <p>La funzione di eliminazione dell'account prova a rimuovere il profilo,
          le carte salvate e l'utenza Firebase. Le richieste di collezioni e gli
          eventuali dati tecnici conservati dai fornitori potrebbero richiedere
          una cancellazione o verifica aggiuntiva.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">06 / I TUOI DIRITTI</span>
        <h2>Gestione dei dati e diritti GDPR</h2>
        <p>Puoi modificare il nome utente, cambiare la password se usi l'accesso
          con email e richiedere l'eliminazione dell'account dalle
          <Link to="/impostazioni"> impostazioni</Link>. Puoi inoltre chiedere,
          secondo i casi, accesso, rettifica, cancellazione, limitazione,
          portabilità o opposizione al trattamento dei tuoi dati.</p>
        <p>Puoi proporre reclamo all'autorità di controllo competente,
          in Italia il <a href="https://www.garanteprivacy.it/" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali</a>.</p>
      </article>

      <article className="legal-page__card">
        <span className="legal-page__number">07 / SICUREZZA E AGGIORNAMENTI</span>
        <h2>Sicurezza dell'account</h2>
        <p>L'autenticazione è affidata a Firebase Authentication e i dati
          delle collezioni sono collegati all'identificativo dell'utente.
          Le misure effettive dipendono anche dalle regole di sicurezza e
          dalle impostazioni dei servizi utilizzati.</p>
        <p>Questa informativa potrà essere aggiornata quando cambiano
          funzionalità, fornitori o modalità di trattamento.</p>
      </article>
    </div>
    <nav className="legal-page__footer" aria-label="Informative">
      <Link to="/cookie">Leggi la Cookie Policy <span aria-hidden="true">→</span></Link>
      <Link to="/">Torna alla homepage <span aria-hidden="true">→</span></Link>
    </nav>
  </section>
);

export default Privacy;
