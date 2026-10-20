import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import CustomSelect from "../components/CustomSelect";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

import "../styles/requests.css";

const initialForm = {
  collectionName: "",
  publisher: "",
  type: "Carte",
  notes: "",
};

const RequestCollection = () => {
  const { user, authLoading } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadPendingRequests = async () => {
      if (authLoading || !user) return;

      setLoadingRequests(true);

      try {
        const requestsQuery = query(
          collection(db, "collectionRequests"),
          where("userId", "==", user.uid),
        );
        const snapshot = await getDocs(requestsQuery);
        const pending = snapshot.docs.filter(
          (document) => document.data().status === "pending",
        ).length;

        setPendingCount(pending);
      } catch (loadError) {
        console.error(loadError);
        setError("Non riesco a controllare le richieste già inviate.");
      } finally {
        setLoadingRequests(false);
      }
    };

    loadPendingRequests();
  }, [authLoading, user]);

  const reachedLimit = pendingCount >= 3;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || reachedLimit || submitting) return;

    const collectionName = form.collectionName.trim();

    if (collectionName.length < 2) {
      setError("Inserisci il nome della collezione.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await addDoc(collection(db, "collectionRequests"), {
        userId: user.uid,
        userEmail: user.email || "",
        username: user.displayName || "",
        collectionName,
        publisher: form.publisher.trim(),
        type: form.type,
        notes: form.notes.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setForm(initialForm);
      setPendingCount((current) => current + 1);
      setSuccess(true);
    } catch (submitError) {
      console.error(submitError);
      setError("Non riesco a inviare la richiesta. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <section className="request-page">
        <p>Controllo accesso...</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="request-page">
      <Link className="request-back" to="/">
        ← Torna alle collezioni
      </Link>

      <div className="request-heading">
        <p className="eyebrow">Suggerisci una collezione</p>
        <h1>Non la trovi su MancoLista?</h1>
        <p>
          Inviaci i dettagli della collezione che vorresti aggiungere. Le
          richieste vengono valutate prima dell'inserimento.
        </p>
      </div>

      <div className="request-layout">
        <form className="request-form" onSubmit={handleSubmit}>
          <label>
            Nome collezione *
            <input
              type="text"
              value={form.collectionName}
              onChange={(event) =>
                updateField("collectionName", event.target.value)
              }
              placeholder="Es. Topps Formula 1 2026"
              required
              maxLength={100}
            />
          </label>

          <div className="request-form__row">
            <label>
              Marca / editore
              <input
                type="text"
                value={form.publisher}
                onChange={(event) => updateField("publisher", event.target.value)}
                placeholder="Es. Panini, Topps..."
                maxLength={80}
              />
            </label>

            <label>
              Tipo
              <CustomSelect
                value={form.type}
                onChange={(value) => updateField("type", value)}
                ariaLabel="Seleziona il tipo di collezione"
                options={[
                  { value: "Carte", label: "Carte" },
                  { value: "Figurine", label: "Figurine" },
                  { value: "Trading Card Game", label: "Trading Card Game" },
                  { value: "Altro", label: "Altro" },
                ]}
              />
            </label>
          </div>

          <label>
            Note
            <textarea
              rows="5"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Aggiungi eventuali informazioni utili..."
              maxLength={1000}
            />
          </label>

          {error && <p className="request-error">{error}</p>}
          {success && (
            <p className="request-success">
              Richiesta inviata! La trovi ora tra le richieste da valutare.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || loadingRequests || reachedLimit}
          >
            {submitting
              ? "Invio in corso..."
              : reachedLimit
                ? "Hai già 3 richieste in attesa"
                : "Invia richiesta"}
          </button>
        </form>

        <aside className="request-info">
          <p className="eyebrow">Le tue richieste</p>
          <strong>{pendingCount}/3</strong>
          <span>richieste attualmente in attesa</span>
          <p>
            Per evitare spam puoi avere al massimo tre richieste aperte nello
            stesso momento.
          </p>
        </aside>
      </div>
    </section>
  );
};

export default RequestCollection;
