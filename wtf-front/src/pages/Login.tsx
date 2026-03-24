import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  // estados para guardar lo que escribe el usuario
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // useNavigate es el equivalente a window.location.href en React
  const navigate = useNavigate()

  // si ya hay sesion, mando al inicio
  if (localStorage.getItem("user")) {
    navigate("/")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const response = await fetch("http://localhost:5001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      // guardo el usuario en localStorage y voy al inicio
      localStorage.setItem("user", JSON.stringify(data.user))
      navigate("/")
    } else {
      setError(data.error)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>WhereTheFit</h1>
        <p>Iniciá sesión para continuar</p>

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
          <button type="submit" className="btn">Iniciar sesión</button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="form-footer">
          ¿No tenés cuenta? <a href="/create">Registrate</a>
        </div>
      </div>
    </div>
  )
}

export default Login