import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

function SetPassword() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    const response = await fetch("http://localhost:5001/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)
      navigate("/")
    } else {
      setError(data.error)
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
          <div className="login-logo" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span className="login-logo-icon">
              <img src="/logo-wtf.svg" alt="WhereTheFit logo" width={45} height={40} />
            </span>
            <span>Configurá tu contraseña</span>
          </div>

          <p style={{ textAlign: "center", color: "var(--color-muted)", marginBottom: "16px" }}>
            Tu cuenta está vinculada a Google. Creá una contraseña para poder iniciar sesión de ambas formas.
          </p>

          <form onSubmit={handleSubmit}>
            <input type="email" value={email} disabled style={{ opacity: 0.6 }} />
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
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="submit" className="btn">Guardar contraseña</button>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>

      <footer className="footer">
        © 2026 WhereTheFit. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default SetPassword
