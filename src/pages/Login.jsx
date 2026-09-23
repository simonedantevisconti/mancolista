import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, authLoading } = useAuth();

  const [mode, setMode] = useState(
    searchParams.get("mode") === "signup" ? "signup" : "login",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(null);

  const isSignup = mode === "signup";

  const saveUserProfile = async (firebaseUser, provider, isNewUser = false) => {
    const userRef = doc(db, "users", firebaseUser.uid);

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || "",
      provider,
      updatedAt: serverTimestamp(),
    };

    if (isNewUser) {
      userData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userData, {
      merge: true,
    });
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Questa email è già registrata. Prova ad accedere.";

      case "auth/invalid-email":
        return "Email non valida.";

      case "auth/weak-password":
        return "La password deve avere almeno 6 caratteri.";

      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Email o password non corretti.";

      case "auth/popup-closed-by-user":
        return "Accesso con Google annullato.";

      case "auth/popup-blocked":
        return "Il browser ha bloccato il popup di Google.";

      case "auth/network-request-failed":
        return "Errore di connessione. Controlla la rete e riprova.";

      default:
        return "Si è verificato un errore. Riprova.";
    }
  };

  const showLoginSuccess = (message = "Bentornato su MancoLista!") => {
    setSuccessModal({
      type: "login",
      title: "Accesso effettuato!",
      message,
    });
  };

  const showRegistrationSuccess = (
    message = "Il tuo account MancoLista è stato creato correttamente.",
  ) => {
    setSuccessModal({
      type: "signup",
      title: "Registrazione completata!",
      message,
    });
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();

    if (loading || googleLoading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        await saveUserProfile(userCredential.user, "email_signup", true);

        showRegistrationSuccess();

        return;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await saveUserProfile(userCredential.user, "email_login", false);

      showLoginSuccess();
    } catch (error) {
      console.error("Errore autenticazione email:", error);

      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading || googleLoading) {
      return;
    }

    setGoogleLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();

      const userCredential = await signInWithPopup(auth, provider);

      const additionalUserInfo = getAdditionalUserInfo(userCredential);

      const isNewGoogleUser = Boolean(additionalUserInfo?.isNewUser);

      await saveUserProfile(
        userCredential.user,
        isNewGoogleUser ? "google_signup" : "google_login",
        isNewGoogleUser,
      );

      if (isNewGoogleUser) {
        showRegistrationSuccess(
          "Il tuo account MancoLista è stato creato correttamente con Google.",
        );

        return;
      }

      showLoginSuccess("Hai effettuato correttamente l'accesso con Google.");
    } catch (error) {
      console.error("Errore autenticazione Google:", error);

      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal(null);
    navigate("/");
  };

  const handleSwitchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError("");
    setEmail("");
    setPassword("");
  };

  if (authLoading) {
    return (
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">Accesso personale</p>

          <h1>Controllo sessione...</h1>

          <p>Stiamo verificando se hai già effettuato l’accesso.</p>
        </div>
      </section>
    );
  }

  /*
   * Se l'utente era già autenticato prima di aprire
   * questa pagina, torna direttamente alla homepage.
   *
   * Se invece ha appena effettuato login/registrazione,
   * successModal è valorizzato e il redirect viene
   * bloccato finché non preme "Continua".
   */
  if (user && !successModal && !loading && !googleLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">
            {isSignup ? "Crea il tuo account" : "Accesso personale"}
          </p>

          <h1>{isSignup ? "Registrati" : "Login"}</h1>

          <p>
            {isSignup
              ? "Crea un account per salvare le tue carte, le doppie e le mancanti."
              : "Accedi per ritrovare tutte le tue collezioni salvate."}
          </p>

          <form onSubmit={handleEmailAuth}>
            <label>
              Email
              <input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="La tua password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={6}
              />
            </label>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || googleLoading}>
              {loading
                ? isSignup
                  ? "Registrazione in corso..."
                  : "Accesso in corso..."
                : isSignup
                  ? "Registrati"
                  : "Accedi"}
            </button>
          </form>

          <div className="login-separator">
            <span>oppure</span>
          </div>

          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading
              ? "Accesso Google..."
              : isSignup
                ? "Registrati con Google"
                : "Continua con Google"}
          </button>

          <button
            type="button"
            className="switch-auth-mode"
            onClick={handleSwitchMode}
            disabled={loading || googleLoading}
          >
            {isSignup
              ? "Hai già un account? Accedi"
              : "Non hai un account? Registrati"}
          </button>
        </div>
      </section>

      {successModal && (
        <div className="auth-success-overlay" role="presentation">
          <div
            className={`auth-success-modal ${
              successModal.type === "signup" ? "auth-success-modal--signup" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-success-title"
            aria-describedby="auth-success-message"
          >
            <div className="auth-success-icon" aria-hidden="true">
              ✓
            </div>

            <p className="auth-success-eyebrow">
              {successModal.type === "signup" ? "Benvenuto" : "Bentornato"}
            </p>

            <h2 id="auth-success-title">{successModal.title}</h2>

            <p id="auth-success-message" className="auth-success-message">
              {successModal.message}
            </p>

            <button type="button" onClick={handleSuccessClose} autoFocus>
              Continua
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
