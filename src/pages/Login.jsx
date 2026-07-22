import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  useEffect(() => {
    if (user) {
      navigate("/le-mie-collezioni");
    }
  }, [user, navigate]);

  const saveUserProfile = async (firebaseUser, provider) => {
    const userRef = doc(db, "users", firebaseUser.uid);

    await setDoc(
      userRef,
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        provider,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
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
      default:
        return "Si è verificato un errore. Riprova.";
    }
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const userCredential = isSignup
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      await saveUserProfile(
        userCredential.user,
        isSignup ? "email_signup" : "email_login",
      );

      navigate("/le-mie-collezioni");
    } catch (error) {
      console.error(error);
      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      await saveUserProfile(userCredential.user, "google");

      navigate("/le-mie-collezioni");
    } catch (error) {
      console.error(error);
      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setGoogleLoading(false);
    }
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

  if (user) {
    return <Navigate to="/le-mie-collezioni" replace />;
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="eyebrow">Accesso personale</p>

        <h1>{isSignup ? "Registrati" : "Login"}</h1>

        <p>
          {isSignup
            ? "Crea un account per salvare le tue carte, doppie e mancanti."
            : "Accedi per ritrovare le tue collezioni salvate."}
        </p>

        <form onSubmit={handleEmailAuth}>
          <label>
            Email
            <input
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              required
              minLength={6}
            />
          </label>

          {error && <p className="login-error">{error}</p>}

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
          {googleLoading ? "Accesso Google..." : "Continua con Google"}
        </button>

        <button
          type="button"
          className="switch-auth-mode"
          onClick={() => {
            setMode(isSignup ? "login" : "signup");
            setError("");
          }}
        >
          {isSignup
            ? "Hai già un account? Accedi"
            : "Non hai un account? Registrati"}
        </button>
      </div>
    </section>
  );
};

export default Login;
