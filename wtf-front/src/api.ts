// obtengo el token guardado en localStorage
const getToken = () => localStorage.getItem("token")

// URL base del backend: en dev es localhost:5001, en prod es relativa (mismo servidor)
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001"

// URL del WebSocket: en dev es localhost:5002, en prod usa el mismo host con /ws
export const WS_BASE = import.meta.env.VITE_WS_URL || (
  API_BASE.includes("localhost")
    ? "ws://localhost:5002"
    : `ws://${window.location.host}/ws`
)

// funcion base para hacer fetch con el token en el header
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken()

  // armo los headers base con el token
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  })

  // si el token expiró, limpio la sesión y mando al login
  if (response.status === 401) {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return response
}
