import { useState } from "react"
import { useSearchParams } from "react-router-dom"

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const token = searchParams.get("token")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.")
      return
    }

    try {
      const response = await fetch("http://localhost:5001/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Error al restablecer la contraseña.")
      }
    } catch {
      setError("Error de conexión con el servidor.")
    }
  }

  // si no hay token en la URL, muestro error
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <nav className="navbar">
          <a href="/" className="navbar-logo">
            <img src="/logo-wtf.svg" alt="WhereTheFit logo" width={45} height={40} /> <span>WhereTheFit</span>
          </a>
        </nav>
        <div className="login-wrapper">
          <div className="login-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <h2 style={{ margin: "0 0 12px 0" }}>Enlace inválido</h2>
            <p style={{ color: "#666" }}>El enlace de restablecimiento no es válido.</p>
            <a href="/login" className="btn btn-secondary" style={{ display: "inline-block", marginTop: "16px" }}>
              Volver al login
            </a>
          </div>
        </div>
        <footer className="footer">© 2026 WhereTheFit. Todos los derechos reservados.</footer>
      </div>
    )
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
          {!success ? (
            <>
              <h2 style={{ textAlign: "center", margin: "0 0 8px 0" }}>Nueva contraseña</h2>
              <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "24px" }}>
                Elegí una nueva contraseña para tu cuenta.
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit" className="btn">Restablecer contraseña</button>
              </form>

              {error && <p className="error">{error}</p>}
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h2 style={{ margin: "0 0 12px 0", color: "#222" }}>¡Contraseña actualizada!</h2>
              <p style={{ color: "#666", marginBottom: "24px" }}>
                Tu contraseña fue restablecida exitosamente.
              </p>
              <a href="/login" className="btn" style={{ display: "inline-block" }}>
                Ir a Iniciar Sesión
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

export default ResetPassword
