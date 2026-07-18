import { useState } from "react"
import { API_BASE } from "../api"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSent(true)
      } else {
        const data = await response.json()
        setError(data.error || "Error al enviar el email.")
      }
    } catch {
      setError("Error de conexión con el servidor.")
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav className="navbar">
        <a href="/" className="navbar-logo">
          <img src="/logo-wtf.svg" alt="WhereTheFit logo" width={45} height={40} /> <span>WhereTheFit</span>
        </a>
      </nav>

      <div className="login-wrapper">
        <div className="login-card">
          {!sent ? (
            <>
              <h2 style={{ textAlign: "center", margin: "0 0 8px 0" }}>¿Olvidaste tu contraseña?</h2>
              <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "24px" }}>
                Ingresá tu email y te enviaremos instrucciones para restablecerla.
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn">Enviar instrucciones</button>
                <a href="/login" className="btn btn-outline" style={{ marginTop: "8px", display: "block", textAlign: "center" }}>
                  Volver al login
                </a>
              </form>

              {error && <p className="error">{error}</p>}
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
              <h2 style={{ margin: "0 0 12px 0", color: "#222" }}>¡Revisá tu email!</h2>
              <p style={{ color: "#666", marginBottom: "24px" }}>
                Si el email está registrado, te enviamos instrucciones para restablecer tu contraseña.
              </p>
              <a href="/login" className="btn" style={{ display: "inline-block" }}>
                Volver al login
              </a>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        © 2026 WhereTheFit. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default ForgotPassword
