import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

import "../styles/account.css";

const Account = () => {
  const navigate = useNavigate();
  const { user, authLoading, refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [savingRequestId, setSavingRequestId] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const providerIds = useMemo(
    () => user?.providerData?.map((provider) => provider.providerId) || [],
    [user],
  );

  const hasPasswordProvider = providerIds.includes("password");
  const hasGoogleProvider = providerIds.includes("google.com");
  const isAdmin = Boolean(
    user &&
      import.meta.env.VITE_ADMIN_UID &&
      user.uid === import.meta.env.VITE_ADMIN_UID,
  );

  const requestStatusLabels = {
    pending: "In attesa",
    approved: "Approvata",
    rejected: "Rifiutata",
    added: "Aggiunta",
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading || !user) return;

      setProfileLoading(true);
      setProfileError("");

      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        const profile = snapshot.exists() ? snapshot.data() : {};

        setUsername(profile.username || user.displayName || "");
      } catch (error) {
        console.error(error);
        setUsername(user.displayName || "");
        setProfileError("Non riesco a caricare tutti i dati del profilo.");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, user, isAdmin]);

  useEffect(() => {
    const loadRequests = async () => {
      if (authLoading || !user) return;

      setRequestsLoading(true);
      setRequestsError("");

      try {
        const requestsRef = collection(db, "collectionRequests");
        const requestsQuery = isAdmin
          ? requestsRef
          : query(requestsRef, where("userId", "==", user.uid));
        const snapshot = await getDocs(requestsQuery);
        const nextRequests = snapshot.docs.map((requestDocument) => ({
          id: requestDocument.id,
          ...requestDocument.data(),
        }));

        nextRequests.sort((first, second) => {
          const firstTime = first.createdAt?.toMillis?.() || 0;
          const secondTime = second.createdAt?.toMillis?.() || 0;
          return secondTime - firstTime;
        });

        setRequests(nextRequests);
      } catch (error) {
        console.error(error);
        setRequestsError(
          isAdmin
            ? "Non riesco a caricare le richieste."
            : "Non riesco a caricare le tue richieste.",
        );
      } finally {
        setRequestsLoading(false);
      }
    };

    loadRequests();
  }, [authLoading, user, isAdmin]);

  const handleRequestStatusChange = async (requestId, nextStatus) => {
    if (!isAdmin) return;

    setSavingRequestId(requestId);
    setRequestsError("");

    try {
      await updateDoc(doc(db, "collectionRequests", requestId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status: nextStatus }
            : request,
        ),
      );
    } catch (error) {
      console.error(error);
      setRequestsError("Non riesco ad aggiornare lo stato della richiesta.");
    } finally {
      setSavingRequestId("");
    }
  };

  const handleUsernameSave = async (event) => {
    event.preventDefault();

    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3) {
      setProfileError("Il nome utente deve avere almeno 3 caratteri.");
      return;
    }

    setProfileSaving(true);
    setProfileError("");
    setProfileMessage("");

    try {
      await updateProfile(user, { displayName: normalizedUsername });

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email || "",
          displayName: normalizedUsername,
          username: normalizedUsername,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await refreshUser();
      setProfileMessage("Nome utente aggiornato.");
    } catch (error) {
      console.error(error);
      setProfileError("Non riesco ad aggiornare il nome utente. Riprova.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (!currentPassword) {
      setPasswordError("Inserisci la password attuale.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La nuova password deve avere almeno 6 caratteri.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");
    setPasswordMessage("");

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password aggiornata correttamente.");
    } catch (error) {
      console.error(error);

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setPasswordError("La password attuale non è corretta.");
      } else {
        setPasswordError("Non riesco ad aggiornare la password. Riprova.");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const deleteUserData = async () => {
    const cardsSnapshot = await getDocs(
      collection(db, "users", user.uid, "cards"),
    );

    const cardDocuments = cardsSnapshot.docs;

    for (let index = 0; index < cardDocuments.length; index += 100) {
      const chunk = cardDocuments.slice(index, index + 100);
      await Promise.all(chunk.map((cardDocument) => deleteDoc(cardDocument.ref)));
    }

    await deleteDoc(doc(db, "users", user.uid));
  };

  const reauthenticateForDeletion = async () => {
    if (hasPasswordProvider) {
      if (!deletePassword) {
        throw new Error("PASSWORD_REQUIRED");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        deletePassword,
      );

      await reauthenticateWithCredential(user, credential);
      return;
    }

    if (hasGoogleProvider) {
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "ELIMINA") {
      setDeleteError('Scrivi "ELIMINA" per confermare.');
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await reauthenticateForDeletion();
      await deleteUserData();
      await deleteUser(user);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);

      if (error.message === "PASSWORD_REQUIRED") {
        setDeleteError("Inserisci la password del tuo account.");
      } else if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setDeleteError("Password non corretta.");
      } else if (error.code === "auth/popup-closed-by-user") {
        setDeleteError("Conferma Google annullata.");
      } else if (error.code === "auth/requires-recent-login") {
        setDeleteError(
          "Per sicurezza effettua nuovamente il login e riprova.",
        );
      } else {
        setDeleteError("Non riesco a eliminare l'account. Riprova.");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <section className="account-page">
        <div className="account-heading">
          <p className="eyebrow">Impostazioni</p>
          <h1>Caricamento account...</h1>
        </div>
      </section>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <section className="account-page">
      <div className="account-heading">
        <p className="eyebrow">Impostazioni</p>
        <h1>Il tuo account</h1>
        <p>
          Gestisci il nome utente, la sicurezza e i dati del tuo profilo
          MancoLista.
        </p>
      </div>

      <div className="account-grid">
        <article className="account-card">
          <div className="account-card__heading">
            <span className="account-card__icon" aria-hidden="true">👤</span>
            <div>
              <h2>Profilo</h2>
              <p>Il nome mostrato nel menu di MancoLista.</p>
            </div>
          </div>

          <form onSubmit={handleUsernameSave} className="account-form">
            <label htmlFor="account-username">Nome utente</label>
            <input
              id="account-username"
              type="text"
              minLength={3}
              maxLength={30}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={profileLoading || profileSaving}
              placeholder="Scegli un nome utente"
            />

            {profileError && <p className="account-error">{profileError}</p>}
            {profileMessage && (
              <p className="account-success">{profileMessage}</p>
            )}

            <button type="submit" disabled={profileLoading || profileSaving}>
              {profileSaving ? "Salvataggio..." : "Salva nome utente"}
            </button>
          </form>
        </article>

        <article className="account-card">
          <div className="account-card__heading">
            <span className="account-card__icon" aria-hidden="true">🔐</span>
            <div>
              <h2>Sicurezza</h2>
              <p>Modifica la password del tuo account.</p>
            </div>
          </div>

          {hasPasswordProvider ? (
            <form onSubmit={handlePasswordChange} className="account-form">
              <label htmlFor="account-current-password">Password attuale</label>
              <input
                id="account-current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Password attuale"
              />

              <label htmlFor="account-new-password">Nuova password</label>
              <input
                id="account-new-password"
                type="password"
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Almeno 6 caratteri"
              />

              {passwordError && (
                <p className="account-error">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="account-success">{passwordMessage}</p>
              )}

              <button type="submit" disabled={passwordSaving}>
                {passwordSaving ? "Aggiornamento..." : "Cambia password"}
              </button>
            </form>
          ) : (
            <p className="account-note">
              Hai effettuato l'accesso con Google. La password viene gestita dal
              tuo account Google.
            </p>
          )}
        </article>

        <article className="account-card account-card--wide">
          <div className="account-card__heading">
            <span className="account-card__icon" aria-hidden="true">ℹ️</span>
            <div>
              <h2>Informazioni account</h2>
              <p>I dati principali collegati alla tua registrazione.</p>
            </div>
          </div>

          <dl className="account-info">
            <div>
              <dt>Email</dt>
              <dd>{user.email || "Non disponibile"}</dd>
            </div>
            <div>
              <dt>Nome utente</dt>
              <dd>{username || "Non impostato"}</dd>
            </div>
            <div>
              <dt>Metodo di accesso</dt>
              <dd>
                {hasGoogleProvider && hasPasswordProvider
                  ? "Google + Email e password"
                  : hasGoogleProvider
                    ? "Google"
                    : "Email e password"}
              </dd>
            </div>
            <div>
              <dt>Account creato</dt>
              <dd>{user.metadata?.creationTime || "Non disponibile"}</dd>
            </div>
            <div>
              <dt>Ultimo accesso</dt>
              <dd>{user.metadata?.lastSignInTime || "Non disponibile"}</dd>
            </div>
            <div>
              <dt>ID account</dt>
              <dd className="account-uid">{user.uid}</dd>
            </div>
          </dl>
        </article>

        <article
          id="richieste"
          className="account-card account-card--wide"
        >
          <div className="account-card__heading">
            <span className="account-card__icon" aria-hidden="true">📨</span>
            <div>
              <h2>{isAdmin ? "Richieste utenti" : "Richieste"}</h2>
              <p>
                {isAdmin
                  ? "Visualizza tutte le richieste e aggiornane lo stato."
                  : "Controlla le collezioni che hai suggerito e il loro stato."}
              </p>
            </div>
          </div>

          {requestsLoading ? (
            <p className="account-note">Caricamento richieste...</p>
          ) : requestsError ? (
            <p className="account-error">{requestsError}</p>
          ) : requests.length === 0 ? (
            <div className="account-requests-empty">
              <p>
                {isAdmin
                  ? "Non ci sono ancora richieste."
                  : "Non hai ancora inviato richieste."}
              </p>
            </div>
          ) : (
            <div className="account-requests-list">
              {requests.map((request) => (
                <article className="account-request-item" key={request.id}>
                  <div className="account-request-item__top">
                    <div>
                      <h3>{request.collectionName}</h3>
                      <p>
                        {request.publisher || "Marca / editore non indicato"}
                        {request.type ? ` · ${request.type}` : ""}
                      </p>
                    </div>

                    {isAdmin ? (
                      <select
                        className="account-request-select"
                        value={request.status || "pending"}
                        disabled={savingRequestId === request.id}
                        onChange={(event) =>
                          handleRequestStatusChange(request.id, event.target.value)
                        }
                      >
                        <option value="pending">In attesa</option>
                        <option value="approved">Approvata</option>
                        <option value="rejected">Rifiutata</option>
                        <option value="added">Aggiunta</option>
                      </select>
                    ) : (
                      <span
                        className={`account-request-status account-request-status--${request.status || "pending"}`}
                      >
                        {requestStatusLabels[request.status] || "In attesa"}
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="account-request-user">
                      <span>{request.username || "Utente"}</span>
                      <span>{request.userEmail || "Email non disponibile"}</span>
                    </div>
                  )}

                  {request.notes && (
                    <p className="account-request-notes">{request.notes}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="account-card account-card--danger account-card--wide">
          <div className="account-card__heading">
            <span className="account-card__icon" aria-hidden="true">⚠️</span>
            <div>
              <h2>Elimina account</h2>
              <p>
                Elimina definitivamente il profilo e tutte le carte salvate su
                MancoLista.
              </p>
            </div>
          </div>

          {!deleteOpen ? (
            <button
              type="button"
              className="account-danger-button"
              onClick={() => setDeleteOpen(true)}
            >
              Elimina account
            </button>
          ) : (
            <div className="account-delete-panel">
              <p>
                Questa operazione è definitiva. Le tue collezioni, le mancanti e
                le doppie verranno eliminate.
              </p>

              {hasPasswordProvider && (
                <label>
                  Password attuale
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    placeholder="Password attuale"
                  />
                </label>
              )}

              <label>
                Scrivi ELIMINA per confermare
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(event) =>
                    setDeleteConfirmation(event.target.value.toUpperCase())
                  }
                  placeholder="ELIMINA"
                />
              </label>

              {deleteError && <p className="account-error">{deleteError}</p>}

              <div className="account-delete-actions">
                <button
                  type="button"
                  className="account-secondary-button"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeleteError("");
                    setDeletePassword("");
                    setDeleteConfirmation("");
                  }}
                  disabled={deleting}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className="account-danger-button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Eliminazione..." : "Elimina definitivamente"}
                </button>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

export default Account;
