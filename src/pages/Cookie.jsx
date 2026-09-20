import "../styles/legal.css";

const Cookie = () => {
  return (
    <section className="legal-page">
      <p className="eyebrow">Informativa</p>
      <h1>Cookie Policy</h1>
      <p className="legal-page__intro">
        Questa pagina descrive in modo sintetico l'uso di cookie e tecnologie
        simili all'interno di MancoLista.
      </p>

      <div className="legal-page__card">
        <h2>Cookie tecnici</h2>
        <p>
          Il sito può utilizzare cookie o tecnologie equivalenti strettamente
          necessarie al funzionamento dell'applicazione, alla gestione della
          sessione e all'autenticazione.
        </p>

        <h2>Servizi esterni</h2>
        <p>
          Alcuni servizi integrati possono impostare identificatori tecnici o
          utilizzare meccanismi equivalenti quando necessari per fornire le
          proprie funzionalità.
        </p>

        <h2>Gestione dal browser</h2>
        <p>
          Puoi gestire o eliminare i cookie direttamente dalle impostazioni del
          browser. La disattivazione di alcuni elementi tecnici può limitare
          alcune funzionalità del sito.
        </p>

        <h2>Aggiornamenti</h2>
        <p>
          Questa informativa può essere aggiornata in caso di modifiche ai
          servizi utilizzati o alle funzionalità dell'applicazione.
        </p>
      </div>
    </section>
  );
};

export default Cookie;
