import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import Layout from "../components/Layout"


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

  if (!currentUser) return null

  return (
    <Layout>
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
    </Layout>
  )
}

export default Profile