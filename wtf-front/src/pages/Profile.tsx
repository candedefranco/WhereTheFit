import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

function Profile() {
  const navigate = useNavigate()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
    }
  }, [])

  async function handleLogout() {
    await fetch("http://localhost:5001/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    localStorage.removeItem("user")
    navigate("/login")
  }

  if (!currentUser) return null

  return (
    <>
      <nav className="navbar">
        <a href="/" className="navbar-logo">WhereTheFit</a>
        <div className="navbar-links">
          <a href="#">Buscar</a>
          <a href="#">Feed</a>
          <a href="/create">Crear</a>
          <a href="/profile">Perfil</a>
          <button onClick={handleLogout} className="btn btn-small">Cerrar sesión</button>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <div className="page-header">
            <h2>Mi perfil</h2>
            <a href={`/edit/${currentUser.id}`} className="btn">Editar perfil</a>
          </div>

          <div className="profile-data">
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Miembro desde:</strong> {new Date(currentUser.created_at).toLocaleDateString("es-AR")}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile