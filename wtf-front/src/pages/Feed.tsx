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
  likes: number
  liked_by: number[]
}

function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState<number | null>(null)
  const [feedType, setFeedType] = useState<"general" | "for-you" | "nearby">("general")
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({})
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({})

  // estados para el filtro por ubicacion
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [km, setKm] = useState(10)
  const [locationError, setLocationError] = useState("")

  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadPosts()
  }, [])

  useEffect(() => {
    // cuando cambia a "nearby", primero obtengo la ubicacion
    if (feedType === "nearby") {
      if (userLat && userLng) {
        loadPosts()
      } else {
        setLocationError("")
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLat(pos.coords.latitude)
            setUserLng(pos.coords.longitude)
          },
          () => setLocationError("No pudimos obtener tu ubicación. Revisá los permisos del browser.")
        )
      }
    } else {
      loadPosts()
    }
  }, [feedType])

  // cuando obtengo lat/lng por primera vez, cargo los posts cercanos
  useEffect(() => {
    if (feedType === "nearby" && userLat && userLng) {
      loadPosts()
    }
  }, [userLat, userLng])

  // cuando cambia el rango de km, recargo
  useEffect(() => {
    if (feedType === "nearby" && userLat && userLng) {
      loadPosts()
    }
  }, [km])

  async function loadPosts() {
    setIsLoading(true)
    let url = ""
    if (feedType === "for-you") {
      url = "/posts/for-you"
    } else if (feedType === "nearby" && userLat && userLng) {
      url = `/posts/nearby?lat=${userLat}&lng=${userLng}&km=${km}`
    } else {
      const params = new URLSearchParams(window.location.search)
      url = `/posts?${params.toString()}`
    }

    const response = await apiFetch(url)
    if (!response.ok) {
      setError("Error al cargar las publicaciones")
      setIsLoading(false)
      return
    }
    const data = await response.json()
    setPosts(data)

    // inicializo estado de likes desde los datos del post
    const liked: Record<number, boolean> = {}
    const counts: Record<number, number> = {}
    data.forEach((p: Post) => {
      liked[p.id] = p.liked_by.includes(currentUser?.id)
      counts[p.id] = p.likes
    })
    setLikedPosts(liked)
    setLikeCounts(counts)
    setIsLoading(false)
  }

  async function handleLike(postId: number, e: React.MouseEvent) {
    e.preventDefault()
    const liked = likedPosts[postId]
    if (liked) {
      await apiFetch(`/likes/${postId}`, { method: "DELETE" })
      setLikedPosts(prev => ({ ...prev, [postId]: false }))
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) - 1 }))
    } else {
      await apiFetch(`/likes/${postId}`, { method: "POST" })
      setLikedPosts(prev => ({ ...prev, [postId]: true }))
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
    }
  }

  async function deletePost(id: number) {
    setPostToDelete(id)
    setShowModal(true)
  }

  async function confirmDelete() {
    if (!postToDelete) return
    const response = await apiFetch(`/posts/${postToDelete}`, { method: "DELETE" })
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

        {/* toggle entre feed general, for you y cerca mío */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            onClick={() => setFeedType("general")}
            className={`btn btn-small ${feedType === "general" ? "" : "btn-secondary"}`}
          >
            Feed general
          </button>
          <button
            onClick={() => setFeedType("for-you")}
            className={`btn btn-small ${feedType === "for-you" ? "" : "btn-secondary"}`}
          >
            ✨ Para vos
          </button>
          <button
            onClick={() => setFeedType("nearby")}
            className={`btn btn-small ${feedType === "nearby" ? "" : "btn-secondary"}`}
          >
            📍 Cerca mío
          </button>
        </div>

        {/* slider de rango, solo visible en modo nearby */}
        {feedType === "nearby" && (
          <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            {locationError ? (
              <p style={{ color: "#e53e3e", fontSize: "13px" }}>{locationError}</p>
            ) : (
              <>
                <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                  Mostrando posts a menos de <strong>{km} km</strong> de tu ubicación
                </p>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={km}
                  onChange={(e) => setKm(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888" }}>
                  <span>1 km</span>
                  <span>50 km</span>
                  <span>100 km</span>
                </div>
              </>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div className="card">
            <p>
              {feedType === "nearby"
                ? "No hay publicaciones cerca tuyo en ese rango. Probá aumentar los km."
                : "No hay publicaciones todavía. ¡Sé la primera en publicar!"}
            </p>
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

                  <div style={{ marginTop: "8px" }}>
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      className={`btn btn-small ${likedPosts[post.id] ? "btn-danger" : "btn-secondary"}`}
                    >
                      {likedPosts[post.id] ? "❤️" : "🤍"} {likeCounts[post.id] || 0}
                    </button>
                  </div>

                  {currentUser && currentUser.id === post.user_id && (
                    <div className="btn-row" style={{ marginTop: "8px" }}>
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