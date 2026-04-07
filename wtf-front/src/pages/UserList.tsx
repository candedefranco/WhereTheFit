import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

// defino el tipo User para TypeScript
interface User {
  id: number
  username: string
  email: string
  profile_picture: string | null
  created_at: string
}

function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  // traigo todos los usuarios de la base de datos
  async function loadUsers() {
    const response = await fetch("http://localhost:5001/users")
    const data = await response.json()
    setUsers(data)
  }

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
    } else {
      loadUsers()
    }
  }, [])

async function deleteUser(id: number) {
    if (!confirm("¿Segura que querés borrar este usuario?")) return

    const response = await apiFetch(`/users/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      // si el usuario borrado es el logueado, limpio el localStorage y mando al login
      if (currentUser && currentUser.id === id) {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        navigate("/login")
      } else {
        loadUsers()
      }
    } else {
      setError("Error al borrar el usuario")
    }
  }

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <div className="page-header">
            <h2>Usuarios</h2>
            <a href="/create" className="btn">+ Nuevo usuario</a>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5}>No hay usuarios todavía</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.created_at).toLocaleDateString("es-AR")}</td>
                    <td>
                      {/* solo muestro los botones en la fila del usuario logueado */}
                      {currentUser && currentUser.id === user.id && (
                        <div className="btn-row">
                          <a href={`/edit/${user.id}`} className="btn btn-small">Editar</a>
                          <button onClick={() => deleteUser(user.id)} className="btn btn-danger btn-small">Borrar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </Layout>
  )
}

export default UserList