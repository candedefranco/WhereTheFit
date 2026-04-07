import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch } from "../api"

function EditUser() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // useParams trae el id de la URL (ej: /edit/3)
  const { id } = useParams()

  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

async function loadUser() {
    const response = await apiFetch(`/users/${id}`)
    const data = await response.json()
    // relleno el formulario con datos actuales
    setUsername(data.username)
    setEmail(data.email)
    setProfilePicture(data.profile_picture || "")
  }

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadUser()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const body: Record<string, string> = { username, email }
    if (password) body.password = password
    if (profilePicture) body.profile_picture = profilePicture

    const response = await apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      // actualizo el localStorage con los nuevos datos
      localStorage.setItem("user", JSON.stringify(data))
      navigate("/")
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
          <a href="/create">Crear</a>
          <a href="/profile">Perfil</a>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h2>Editar usuario</h2>

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
              placeholder="Nueva contraseña (opcional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL de foto de perfil (opcional)"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
            />
            <div className="btn-row">
              <button type="submit" className="btn">Guardar cambios</button>
              <a href="/" className="btn btn-secondary">Cancelar</a>
            </div>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </>
  )
}

export default EditUser