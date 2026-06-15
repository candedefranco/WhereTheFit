// obtengo el token guardado en localStorage
const getToken = () => localStorage.getItem("token")

// funcion base para hacer fetch con el token en el header
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken()

  // armo los headers base con el token
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(`http://localhost:5001${url}`, {
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