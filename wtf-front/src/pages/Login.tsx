import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

function Login() {
  // estados para guardar lo que escribe el usuario
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

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

    const response = await fetch("http://localhost:5001/auth/login", {
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
    } else {
      setError(data.error)
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
            </form>

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