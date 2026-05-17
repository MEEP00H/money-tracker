import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";
import MoneyTracker from "./money-tracker.jsx";
import AuthScreen from "./AuthScreen.jsx";
import { P } from "./constants";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        background: P.bg, minHeight: "100svh", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Courier New',monospace", color: P.accent, fontSize: 13,
      }}>
        LOADING...
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  return <MoneyTracker user={session.user} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
