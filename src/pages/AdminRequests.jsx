import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

import "../styles/requests.css";

const STATUS_OPTIONS = [
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
  const [openStatusId, setOpenStatusId] = useState("");
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

    return requests.filter(
      (request) => (request.status || "pending") === statusFilter,
    );
  }, [requests, statusFilter]);

  const handleStatusChange = async (requestId, nextStatus) => {
    setSavingId(requestId);
    setError("");

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
      setOpenStatusId("");
    } catch (saveError) {
      console.error(saveError);
      setError("Non riesco ad aggiornare lo stato della richiesta.");
    } finally {
      setSavingId("");
    }
  };

  if (authLoading) {
    return (
      <section className="admin-requests">
        <p className="request-loading">Controllo accesso...</p>
      </section>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <section className="admin-requests">
      <div className="request-heading">
        <p className="eyebrow">Admin</p>
        <h1>Richieste collezioni</h1>
        <p>
          Visualizza tutte le richieste degli utenti e aggiornane lo stato.
        </p>
      </div>

      <div className="admin-request-toolbar">
        <label>
          Stato
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Tutte</option>
            {STATUS_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <strong>{filteredRequests.length} richieste</strong>
      </div>

      {error && <p className="request-error">{error}</p>}
      {loading && (
        <p className="request-loading">Caricamento richieste...</p>
      )}

      <div className="admin-request-list">
        {filteredRequests.map((request) => (
          <article className="admin-request-card" key={request.id}>
            <div className="admin-request-card__top">
              <div>
                <span
                  className={`request-status request-status--${request.status || "pending"}`}
                >
                  {STATUS_OPTIONS.find(
                    (option) =>
                      option.value === (request.status || "pending"),
                  )?.label || "In attesa"}
                </span>

                <h2>{request.collectionName}</h2>

                <p>
                  {request.publisher || "Marca / editore non indicato"}
                  {request.type ? ` · ${request.type}` : ""}
                </p>
              </div>

              <div className="status-dropdown">
                <button
                  type="button"
                  className={`status-dropdown__trigger status-dropdown__trigger--${request.status || "pending"}`}
                  aria-haspopup="listbox"
                  aria-expanded={openStatusId === request.id}
                  disabled={savingId === request.id}
                  onClick={() =>
                    setOpenStatusId((current) =>
                      current === request.id ? "" : request.id,
                    )
                  }
                >
                  <span className="status-dropdown__dot" aria-hidden="true" />
                  <span>
                    {STATUS_OPTIONS.find(
                      (option) =>
                        option.value === (request.status || "pending"),
                    )?.label || "In attesa"}
                  </span>
                  <span className="status-dropdown__chevron" aria-hidden="true">
                    {openStatusId === request.id ? "▲" : "▼"}
                  </span>
                </button>

                {openStatusId === request.id && (
                  <div className="status-dropdown__menu" role="listbox">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        role="option"
                        aria-selected={
                          option.value === (request.status || "pending")
                        }
                        className={`status-dropdown__option status-dropdown__option--${option.value}`}
                        onClick={() =>
                          handleStatusChange(request.id, option.value)
                        }
                      >
                        <span
                          className="status-dropdown__dot"
                          aria-hidden="true"
                        />
                        <span>{option.label}</span>
                        {option.value === (request.status || "pending") && (
                          <span
                            className="status-dropdown__check"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <dl className="admin-request-details admin-request-details--compact">
              <div>
                <dt>Utente</dt>
                <dd>{request.username || "—"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{request.userEmail || "—"}</dd>
              </div>
            </dl>

            {request.notes && (
              <p className="admin-request-notes">{request.notes}</p>
            )}
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
