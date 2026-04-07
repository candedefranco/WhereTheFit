import { useState } from "react"
import { useNavigate } from "react-router-dom"

function CreateUser() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // si ya hay sesion, mando al inicio
  if (localStorage.getItem("user")) {
    navigate("/")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // armo el body solo con los campos que tienen valor
    const body: Record<string, string> = { username, email, password }
    if (profilePicture) body.profile_picture = profilePicture

    const response = await fetch("http://localhost:5001/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      navigate("/login")
    } else {
      setError(data.error)
    }
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
              <button type="submit" className="btn">Crear usuario</button>
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