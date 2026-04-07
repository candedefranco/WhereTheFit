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
  user_id: number
  username: string
}

function Feed() {
  // estado para guardar la lista de posts
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
    } else {
      loadPosts()
    }
  }, [])

  async function loadPosts() {
    // traigo todos los posts del back
    const response = await apiFetch("/posts")
    const data = await response.json()
    setPosts(data)
  }

  async function deletePost(id: number) {
    if (!confirm("¿Segura que querés borrar esta publicación?")) return

    // borro el post del back
    const response = await apiFetch(`/posts/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      // recargo los posts despues de borrar
      loadPosts()
    } else {
      setError("Error al borrar la publicación")
    }
  }

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h2>Feed</h2>
          <a href="/feed/create" className="btn">+ Publicar</a>
        </div>

        {posts.length === 0 ? (
          <div className="card">
            <p>No hay publicaciones todavía. ¡Sé la primera en publicar!</p>
          </div>
        ) : (
          // muestro cada post como una card
          posts.map(post => (
            <div key={post.id} className="card post-card">
              {/* muestro la imagen solo si existe */}
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="post-image" />
              )}
              <div className="post-content">
                <div className="post-header">
                  <h3>
                     <a href={`/feed/post/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {post.title}
                    </a>
                  </h3>
                  {/* badge que muestra el estado del post */}
                  <span className={`status-badge ${post.status}`}>
                    {post.status === "active" ? "En búsqueda" : "Resuelto"}
                  </span>
                </div>
                {/* meta info del post */}
                <p className="post-meta">@{post.username} · {new Date(post.created_at).toLocaleDateString("es-AR")}</p>
                {post.category && <p className="post-category">{post.category}</p>}
                <p className="post-description">{post.description}</p>

                {/* solo muestro acciones si el post es del usuario logueado */}
                {currentUser && currentUser.id === post.user_id && (
                  <div className="btn-row" style={{ marginTop: "12px" }}>
                    <a href={`/feed/edit/${post.id}`} className="btn btn-small">Editar</a>
                    <button onClick={() => deletePost(post.id)} className="btn btn-danger btn-small">Borrar</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </Layout>
  )
}

export default Feed