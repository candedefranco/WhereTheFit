import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { API_BASE } from "../api"

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("Token de verificación no encontrado.")
      return
    }

    // llamo al backend para verificar el token
    fetch(`${API_BASE}/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error || "Error al verificar el email.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Error de conexión con el servidor.")
      })
  }, [searchParams])

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav className="navbar">
        <a href="/" className="navbar-logo">
          <img src="/logo-wtf.svg" alt="WhereTheFit logo" width={45} height={40} /> <span>WhereTheFit</span>
        </a>
      </nav>

      <div className="login-wrapper">
        <div className="login-card" style={{ textAlign: "center" }}>
          {status === "loading" && (
            <p style={{ fontSize: "16px", color: "#666" }}>Verificando tu email...</p>
          )}

          {status === "success" && (
            <>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h2 style={{ margin: "0 0 12px 0", color: "#222" }}>¡Email verificado!</h2>
              <p style={{ color: "#666", marginBottom: "24px" }}>{message}</p>
              <a href="/login" className="btn" style={{ display: "inline-block" }}>
                Ir a Iniciar Sesión
              </a>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
              <h2 style={{ margin: "0 0 12px 0", color: "#222" }}>Error de verificación</h2>
              <p style={{ color: "#666", marginBottom: "24px" }}>{message}</p>
              <a href="/login" className="btn btn-secondary" style={{ display: "inline-block" }}>
                Volver al login
              </a>
            </>
          )}
        </div>
      </div>

      <footer className="footer">
        © 2026 WhereTheFit. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default VerifyEmail
