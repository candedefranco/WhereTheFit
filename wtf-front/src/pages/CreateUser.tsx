import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE } from "../api"

function CreateUser() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [error, setError] = useState("")
  // estado para mostrar pantalla de verificación después de crear la cuenta
  const [created, setCreated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // si ya hay sesion, mando al inicio
  if (localStorage.getItem("user")) {
    navigate("/")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // armo el body solo con los campos que tienen valor
    const body: Record<string, string> = { username, email, password }
    if (profilePicture) body.profile_picture = profilePicture

    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    setIsLoading(false)

    if (response.ok) {
      // en vez de redirigir al login, muestro mensaje de verificación
      setCreated(true)
    } else {
      setError(data.error)
    }
  }

  // pantalla de éxito después de crear la cuenta
  if (created) {
    return (
      <>
        <nav className="navbar">
          <a href="/" className="navbar-logo">
            <img src="/logo-wtf.svg" alt="WhereTheFit logo" width={45} height={40} /> <span>WhereTheFit</span>
          </a>
        </nav>

        <div className="login-wrapper">
          <div className="login-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
            <h2 style={{ margin: "0 0 12px 0", color: "#222" }}>¡Revisá tu email para verificar tu cuenta!</h2>
            <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
              Te enviamos un email a <strong>{email}</strong> con un enlace para activar tu cuenta.
              Revisá tu bandeja de entrada (y la carpeta de spam).
            </p>
            <a href="/login" className="btn" style={{ display: "inline-block" }}>
              Ir al login
            </a>
          </div>
        </div>

        <footer className="footer">
          © 2026 WhereTheFit. Todos los derechos reservados.
        </footer>
      </>
    )
  }

  return (
    <>
      <nav className="navbar">
        <a href="/" className="navbar-logo">WhereTheFit</a>
        <div className="navbar-links">
          <a href="#">Buscar</a>
          <a href="#">Feed</a>
          <a href="#">Publicar</a>
          <a href="/profile">Perfil</a>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h2>Crear usuario</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="URL de foto de perfil (opcional)"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
            />
            <div className="btn-row">
              <button type="submit" disabled={isLoading} className="btn">
                {isLoading ? "Creando cuenta..." : "Crear usuario"}
              </button>
              <a href="/" className="btn btn-secondary">Cancelar</a>
            </div>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </>
  )
}

export default CreateUser
