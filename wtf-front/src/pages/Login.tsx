import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { API_BASE } from "../api"

function Login() {
  // estados para guardar lo que escribe el usuario
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  // estado para manejar el caso de email no verificado
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState("")
  const [resendMessage, setResendMessage] = useState("")

  // useNavigate es el equivalente a window.location.href en React
  const navigate = useNavigate()

  useEffect(() => {
    // si ya hay sesion activa, mando al inicio
    if (localStorage.getItem("user")) {
      navigate("/")
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setEmailNotVerified(false)
    setResendMessage("")

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      // guardo el usuario y el token en localStorage
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)
      navigate("/")
    } else if (data.error === "google_only") {
      navigate(`/set-password?email=${encodeURIComponent(email)}`)
    } else if (data.error === "email_not_verified") {
      // muestro el mensaje de email no verificado con opción de reenviar
      setEmailNotVerified(true)
      setUnverifiedEmail(data.email)
    } else {
      setError(data.error)
    }
  }

  // reenvía el email de verificación
  async function handleResendVerification() {
    setResendMessage("")
    try {
      const response = await fetch(`${API_BASE}/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      })

      if (response.ok) {
        setResendMessage("¡Email de verificación reenviado! Revisá tu bandeja de entrada.")
      } else {
        setResendMessage("Error al reenviar el email. Intentá de nuevo.")
      }
    } catch {
      setResendMessage("Error de conexión con el servidor.")
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* navbar sin boton de logout */}
      <nav className="navbar">
        <a href="/" className="navbar-logo">
          <img src="/logo-wtf.svg" alt="WhereTheFit logo" width={45} height={40} /> <span>WhereTheFit</span>
        </a>
      </nav>

      {/* formulario centrado */}
      <div className="login-wrapper">
        <div className="login-card">
          {/* flexbox para centrar y apilar el logo y el texto */}
          <div
            className="login-logo"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span className="login-logo-icon">
              <img src="/logo-wtf.svg" alt="WhereTheFit logo" width={45} height={40}/>
            </span>
            <span>WhereTheFit</span>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
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
            <button type="submit" className="btn">Iniciar Sesión</button>
            <a href="/create" className="btn btn-outline" style={{ marginTop: "8px" }}>
              Registrarse
            </a>
            {/* boton de login con Google */}
            <a href={`${API_BASE}/auth/google`} className="btn btn-secondary" style={{ marginTop: "8px", display: "block", textAlign: "center" }}>
               Continuar con Google
            </a>
          </form>

          {/* link de olvidé mi contraseña */}
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a href="/forgot-password" style={{ color: "#5a9199", fontSize: "14px", textDecoration: "none" }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* mensaje de email no verificado */}
          {emailNotVerified && (
            <div style={{
              marginTop: "16px",
              padding: "16px",
              backgroundColor: "#fff3cd",
              borderRadius: "8px",
              border: "1px solid #ffc107",
              textAlign: "center"
            }}>
              <p style={{ margin: "0 0 12px 0", color: "#856404", fontSize: "14px" }}>
                Tu email no está verificado. Revisá tu bandeja de entrada.
              </p>
              <button
                onClick={handleResendVerification}
                className="btn btn-outline"
                style={{ fontSize: "13px", padding: "8px 16px" }}
              >
                Reenviar email de verificación
              </button>
              {resendMessage && (
                <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#666" }}>
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          {error && <p className="error">{error}</p>}
        </div>
      </div>

      {/* footer */}
      <footer className="footer">
        © 2026 WhereTheFit. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default Login
