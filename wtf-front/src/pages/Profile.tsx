import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

// defino el tipo Post para TypeScript
interface Post {
  id: number
  title: string
  description: string
  category: string | null
  image_url: string | null
  status: string
  created_at: string
}

function Profile() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  async function loadUserPosts() {
    // traigo todos los posts del usuario logueado
    const response = await apiFetch(`/posts/user/${currentUser.id}`)
    const data = await response.json()
    setPosts(data)
  }

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadUserPosts()
  }, [])

  if (!currentUser) return null

  return (
    <Layout>
      <div className="container">
        {/* datos del perfil */}
        <div className="card" style={{ marginBottom: "16px" }}>
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

        {/* historial de publicaciones */}
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Mis publicaciones ({posts.length})</h3>

          {posts.length === 0 ? (
            <p style={{ color: "#888" }}>Todavía no publicaste nada.</p>
          ) : (
            posts.map(post => (
              <div key={post.id} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div className="post-header">
                  <a href={`/feed/post/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <strong>{post.title}</strong>
                  </a>
                  {/* badge de estado */}
                  <span className={`status-badge ${post.status}`}>
                    {post.status === "active" ? "En búsqueda" : "Resuelto"}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
                  {new Date(post.created_at).toLocaleDateString("es-AR")}
                  {post.category && ` · ${post.category}`}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Profile