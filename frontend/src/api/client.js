const BASE_URL = import.meta.env.VITE_API_URL;

let accessToken = null;
let onAuthFailure = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setOnAuthFailure(callback) {
  onAuthFailure = callback;
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("tally-refresh-token");
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  setAccessToken(data.accessToken);
  localStorage.setItem("tally-refresh-token", data.refreshToken);
  return data.accessToken;
}

export async function api(endpoint, options = {}) {
  const { body, method = body ? "POST" : "GET", headers = {}, ...rest } = options;

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...rest,
  };

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  let res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      config.headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${endpoint}`, config);
    } else {
      onAuthFailure?.();
      throw new ApiError("SESSAO_EXPIRADA", 401);
    }
  }

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.erro || "ERRO_DESCONHECIDO", res.status, data.erros);
  }

  return data;
}

export class ApiError extends Error {
  constructor(message, status, erros) {
    super(message);
    this.status = status;
    this.erros = erros;
  }
}
