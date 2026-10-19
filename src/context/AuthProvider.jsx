import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRevision, setUserRevision] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;

    await auth.currentUser.reload();
    setUserRevision((current) => current + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isLoggedIn: Boolean(user),
        logout,
        refreshUser,
        userRevision,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
