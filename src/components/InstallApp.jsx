import { useEffect, useState } from "react";
import "../styles/install-app.css";

const isStandaloneMode = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

const InstallApp = () => {
  const [open, setOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="install-app-button"
        onClick={() => setOpen(true)}
        aria-label="Come installare MancoLista sul telefono"
        title="Installa MancoLista"
      >
        <span className="install-app-button__icon" aria-hidden="true">
          ↓
        </span>
      </button>

      {open && (
        <div
          className="install-app-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <section
            className="install-app-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-app-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="install-app-panel__header">
              <div>
                <p className="install-app-panel__eyebrow">MancoLista App</p>
                <h2 id="install-app-title">Aggiungila al telefono</h2>
              </div>

              <button
                type="button"
                className="install-app-close"
                onClick={() => setOpen(false)}
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>

            <p className="install-app-panel__intro">
              Installa MancoLista sulla schermata Home e usala come una normale
              app, senza dover aprire ogni volta il browser.
            </p>

            {installPrompt && (
              <button
                type="button"
                className="install-app-primary"
                onClick={handleInstall}
              >
                Installa MancoLista
              </button>
            )}

            <div className="install-app-instructions">
              <div>
                <strong>Android</strong>
                <ol>
                  <li>Apri MancoLista con Chrome.</li>
                  <li>Tocca il menu ⋮ in alto a destra.</li>
                  <li>Scegli “Installa app” o “Aggiungi a schermata Home”.</li>
                </ol>
              </div>

              <div>
                <strong>iPhone / iPad</strong>
                <ol>
                  <li>Apri MancoLista con Safari.</li>
                  <li>Tocca il pulsante Condividi.</li>
                  <li>Scegli “Aggiungi alla schermata Home”.</li>
                </ol>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default InstallApp;
