import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  collection,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

import "../styles/requests.css";

const statusOptions = [
  { value: "pending", label: "In attesa" },
  { value: "approved", label: "Approvata" },
  { value: "rejected", label: "Rifiutata" },
  { value: "added", label: "Aggiunta" },
];

const AdminRequests = () => {
  const { user, authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const adminUid = import.meta.env.VITE_ADMIN_UID || "";
  const isAdmin = Boolean(user && adminUid && user.uid === adminUid);

  useEffect(() => {
    const loadRequests = async () => {
      if (authLoading || !isAdmin) return;

      setLoading(true);
      setError("");

      try {
        const snapshot = await getDocs(collection(db, "collectionRequests"));
        const data = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        data.sort((first, second) => {
          const firstTime = first.createdAt?.toMillis?.() || 0;
          const secondTime = second.createdAt?.toMillis?.() || 0;
          return secondTime - firstTime;
        });

        setRequests(data);
      } catch (loadError) {
        console.error(loadError);
        setError("Non riesco a caricare le richieste.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [authLoading, isAdmin]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  const updateStatus = async (request, nextStatus) => {
    setSavingId(request.id);
    setError("");

    try {
      await updateDoc(request.ref || { path: "" }, {});
    } catch {
      try {
        const { doc } = await import("firebase/firestore");
        await updateDoc(doc(db, "collectionRequests", request.id), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });

        setRequests((current) =>
          current.map((item) =>
            item.id === request.id ? { ...item, status: nextStatus } : item,
          ),
        );
      } catch (saveError) {
        console.error(saveError);
        setError("Non riesco ad aggiornare lo stato della richiesta.");
      }
    } finally {
      setSavingId("");
    }
  };

  if (authLoading) {
    return <section className="admin-requests"><p>Controllo accesso...</p></section>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <section className="admin-requests">
        <div className="request-heading">
          <p className="eyebrow">Area riservata</p>
          <h1>Accesso non autorizzato</h1>
          <p>Questa sezione è disponibile solo per l'amministratore.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-requests">
      <div className="request-heading">
        <p className="eyebrow">Admin</p>
        <h1>Richieste collezioni</h1>
        <p>Valuta e aggiorna lo stato delle richieste inviate dagli utenti.</p>
      </div>

      <div className="admin-request-toolbar">
        <label>
          Stato
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Tutte</option>
            {statusOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <strong>{filteredRequests.length} richieste</strong>
      </div>

      {error && <p className="request-error">{error}</p>}
      {loading && <p className="request-loading">Caricamento richieste...</p>}

      <div className="admin-request-list">
        {filteredRequests.map((request) => (
          <article className="admin-request-card" key={request.id}>
            <div className="admin-request-card__top">
              <div>
                <span className={`request-status request-status--${request.status}`}>
                  {statusOptions.find((item) => item.value === request.status)?.label ||
                    request.status}
                </span>
                <h2>{request.collectionName}</h2>
                <p>
                  {request.publisher || "Editore non indicato"} · {request.type}
                </p>
              </div>

              <select
                value={request.status || "pending"}
                disabled={savingId === request.id}
                onChange={(event) => updateStatus(request, event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <dl className="admin-request-details">
              <div><dt>Utente</dt><dd>{request.username || "—"}</dd></div>
              <div><dt>Email</dt><dd>{request.userEmail || "—"}</dd></div>
              <div><dt>Serie</dt><dd>{request.series || "—"}</dd></div>
              <div><dt>Carte</dt><dd>{request.estimatedCards || "—"}</dd></div>
            </dl>

            {request.referenceUrl && (
              <a
                className="request-reference"
                href={request.referenceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Apri riferimento ↗
              </a>
            )}

            {request.notes && <p className="admin-request-notes">{request.notes}</p>}
          </article>
        ))}

        {!loading && filteredRequests.length === 0 && (
          <div className="request-empty">
            <h2>Nessuna richiesta</h2>
            <p>Non ci sono richieste con questo stato.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminRequests;
