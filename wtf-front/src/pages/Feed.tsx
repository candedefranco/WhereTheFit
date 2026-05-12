import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"
import ConfirmModal from "../components/ConfirmModal"
import Masonry from "react-masonry-css"

interface Post {
  id: number
  title: string
  description: string
  category: string | null
  image_url: string | null
  images: { id: number; url: string; order: number }[]
  tags?: string[]
  status: string
  created_at: string
  user_id: number
  username: string
}

function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState<number | null>(null)
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadPosts()
  }, [])

  async function loadPosts() {
    const params = new URLSearchParams(window.location.search)
    const response = await apiFetch(`/posts?${params.toString()}`)
    if (!response.ok) {
      setError("Error al cargar las publicaciones")
      return
    }
    const data = await response.json()
    setPosts(data)
  }

  async function deletePost(id: number) {
    setPostToDelete(id)
    setShowModal(true)
  }

  async function confirmDelete() {
    if (!postToDelete) return

    const response = await apiFetch(`/posts/${postToDelete}`, {
      method: "DELETE",
    })

    setShowModal(false)
    setPostToDelete(null)

    if (response.ok) {
      loadPosts()
    } else {
      setError("Error al borrar la publicación")
    }
  }

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
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {posts.map(post => (
              <div key={post.id} className="card post-card feed-card">
                {(post.images?.[0]?.url || post.image_url) && (
                  <a href={`/feed/post/${post.id}`}>
                    <img
                      src={post.images?.[0]?.url || post.image_url || ""}
                      alt={post.title}
                      className="post-image feed-image"
                    />
                  </a>
                )}
                <div className="post-content feed-content">
                  <div className="post-header">
                    <h3>
                      <a href={`/feed/post/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {post.title}
                      </a>
                    </h3>
                    <span className={`status-badge ${post.status}`}>
                      {post.status === "active" ? "En búsqueda" : "Resuelto"}
                    </span>
                  </div>
                  <p className="post-meta">
                    <a href={`/profile/${post.user_id}`} style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}>
                      @{post.username}
                    </a>
                    {" · "}
                    {new Date(post.created_at).toLocaleDateString("es-AR")}
                  </p>
                  {post.category && <p className="post-category">{post.category}</p>}
                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags-list">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="post-tag-item">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <p className="post-description truncate-text">{post.description}</p>
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

      {showModal && (
        <ConfirmModal
          message="¿Segura que querés borrar esta publicación?"
          onConfirm={confirmDelete}
          onCancel={() => { setShowModal(false); setPostToDelete(null) }}
        />
      )}
    </Layout>
  )
}

export default Feed