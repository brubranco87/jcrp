import { useState, useCallback } from "react";

const CREDENTIALS = {
  email: "jcrpestacionamento@gmail.com",
  password: "Jcrp2026!",
};

const SESSION_KEY = "jcrp_auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );
  const [error, setError] = useState("");

  const login = useCallback((email: string, password: string) => {
    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Usuário ou senha incorretos.");
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout, error };
}
