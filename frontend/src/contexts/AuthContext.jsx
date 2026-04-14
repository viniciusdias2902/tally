import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAccessToken, setOnAuthFailure } from "../api/client.js";
import * as authApi from "../api/auth.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const limparAuth = useCallback(() => {
    setUsuario(null);
    setAccessToken(null);
    localStorage.removeItem("tally-refresh-token");
    localStorage.removeItem("tally-usuario");
  }, []);

  useEffect(() => {
    setOnAuthFailure(limparAuth);
  }, [limparAuth]);

  useEffect(() => {
    const refreshToken = localStorage.getItem("tally-refresh-token");
    const usuarioSalvo = localStorage.getItem("tally-usuario");

    if (!refreshToken || !usuarioSalvo) {
      setCarregando(false);
      return;
    }

    authApi
      .refresh(refreshToken)
      .then((data) => {
        setAccessToken(data.accessToken);
        localStorage.setItem("tally-refresh-token", data.refreshToken);
        setUsuario(JSON.parse(usuarioSalvo));
      })
      .catch(() => {
        limparAuth();
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [limparAuth]);

  async function entrar({ email, senha }) {
    const data = await authApi.login({ email, senha });
    setAccessToken(data.accessToken);
    localStorage.setItem("tally-refresh-token", data.refreshToken);
    localStorage.setItem("tally-usuario", JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }

  async function registrar({ nome, email, senha }) {
    const data = await authApi.registrar({ nome, email, senha });
    setAccessToken(data.accessToken);
    localStorage.setItem("tally-refresh-token", data.refreshToken);
    localStorage.setItem("tally-usuario", JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }

  async function sair() {
    const refreshToken = localStorage.getItem("tally-refresh-token");
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      limparAuth();
    }
  }

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, autenticado: !!usuario, entrar, registrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
