import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

// @ts-expect-error (para que typescript no moleste con la libreria)
import Masonry from "react-masonry-css"

// defino el tipo Post para TypeScript
interface Post {
  id: number
  title: string
  description: string
  category: string | null
  image_url: string | null
  tags?: string[] // lo agregamos como opcional para que no rompa si el back no lo manda
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

  // configuracion de columnas para el diseño masonry estilo pinterest
  const breakpointColumnsObj = {
    default: 5,
    1400: 4,
    1100: 3,
    700: 2,
    500: 1
  }

  return (
    <Layout>
      <div className="container feed-container">
        <div className="page-header">
          <h2>Feed</h2>
          <a href="/feed/create" className="btn">+ Publicar</a>
        </div>

        {posts.length === 0 ? (
          <div className="card">
            <p>No hay publicaciones todavía. ¡Sé la primera en publicar!</p>
          </div>
        ) : (
          // muestro cada post como una card usando Masonry
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {posts.map(post => (
              <div key={post.id} className="card post-card feed-card">
                {/* muestro la imagen solo si existe */}
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="post-image feed-image" />
                )}
                <div className="post-content feed-content">
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

                  {/* muestro los tags si es que vienen desde el backend */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags-list">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="post-tag-item">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <p className="post-description truncate-text">{post.description}</p>

                  {/* solo muestro acciones si el post es del usuario logueado */}
                  {currentUser && currentUser.id === post.user_id && (
                    <div className="btn-row" style={{ marginTop: "12px" }}>
                      <a href={`/feed/edit/${post.id}`} className="btn btn-small">Editar</a>
                      <button onClick={() => deletePost(post.id)} className="btn btn-danger btn-small">Borrar</button>
                    </div>
                  )}
                </div>
              </div>
            )) as React.ReactNode}
          </Masonry>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </Layout>
  )
}

export default Feed