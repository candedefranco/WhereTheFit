import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

const PAGE_SIZE = 10

interface User {
  id: number
  username: string
  profile_picture: string | null
  created_at: string
}

interface Post {
  id: number
  title: string
  status: string
  created_at: string
  category: string | null
}

function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsTotal, setPostsTotal] = useState(0)
  const [loadingMorePosts, setLoadingMorePosts] = useState(false)

  const [followers, setFollowers] = useState<number>(0)
  const [following, setFollowing] = useState<number>(0)
  const [isFollowing, setIsFollowing] = useState(false)

  // loading de la carga inicial del perfil
  const [isLoading, setIsLoading] = useState(true)
  // loading del boton de seguir/dejar de seguir
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams()

  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    // si el id es el mio, mando al perfil propio
    if (parseInt(id!) === currentUser.id) {
      navigate("/profile")
      return
    }
    loadUserData()
  }, [id])

  async function loadUserData() {
    setIsLoading(true)

    try {
      // traigo datos del usuario
      const userRes = await apiFetch(`/users/${id}`)
      const userData = await userRes.json()
      setUser(userData)

      // traigo la primera pagina de posts del usuario
      const postsRes = await apiFetch(`/posts/user/${id}?limit=${PAGE_SIZE}&offset=0`)
      const postsData = await postsRes.json()
      setPosts(postsData.items)
      setPostsTotal(postsData.total)

      // traigo el total de seguidores (limit=1 porque solo me interesa el total)
      const followersRes = await apiFetch(`/follows/${id}/followers?limit=1`)
      const followersData = await followersRes.json()
      setFollowers(followersData.total)

      // traigo el total de seguidos
      const followingRes = await apiFetch(`/follows/${id}/following?limit=1`)
      const followingData = await followingRes.json()
      setFollowing(followingData.total)

      // verifico si lo sigo
      const isFollowingRes = await apiFetch(`/follows/${id}/is-following`)
      const isFollowingData = await isFollowingRes.json()
      setIsFollowing(isFollowingData.is_following)
    } finally {
      setIsLoading(false)
    }
  }

  // cargo mas publicaciones cuando aprieto "ver mas"
  async function loadMorePosts() {
    setLoadingMorePosts(true)
    try {
      const res = await apiFetch(`/posts/user/${id}?limit=${PAGE_SIZE}&offset=${posts.length}`)
      const data = await res.json()
      setPosts(prev => [...prev, ...data.items])
      setPostsTotal(data.total)
    } finally {
      setLoadingMorePosts(false)
    }
  }

  async function handleFollow() {
    setIsFollowLoading(true)

    try {
      if (isFollowing) {
        await apiFetch(`/follows/${id}`, { method: "DELETE" })
        setIsFollowing(false)
        setFollowers(followers - 1)
      } else {
        await apiFetch(`/follows/${id}`, { method: "POST" })
        setIsFollowing(true)
        setFollowers(followers + 1)
      }
    } finally {
      setIsFollowLoading(false)
    }
  }

  // muestro un mensaje de carga mientras llegan los datos del perfil
  if (isLoading) {
    return (
      <Layout>
        <div className="container">
          <div className="loading-spinner-container"><div className="loading-spinner" /></div>
        </div>
      </Layout>
    )
  }

  if (!user) return null

  return (
    <Layout>
      <div className="container">
        {/* datos del perfil */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <div className="page-header">
            <h2>@{user.username}</h2>
            <button
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`btn ${isFollowing ? "btn-secondary" : ""}`}
            >
              {isFollowLoading ? "..." : isFollowing ? "Dejar de seguir" : "Seguir"}
            </button>
          </div>
          <div style={{ display: "flex", gap: "24px", marginTop: "12px" }}>
            <p><strong>{followers}</strong> seguidores</p>
            <p><strong>{following}</strong> seguidos</p>
            <p><strong>{postsTotal}</strong> publicaciones</p>
          </div>
        </div>

        {/* publicaciones del usuario */}
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Publicaciones ({postsTotal})</h3>
          {posts.length === 0 ? (
            <p style={{ color: "#888" }}>Este usuario no tiene publicaciones.</p>
          ) : (
            posts.map(post => (
              <div key={post.id} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div className="post-header">
                  <a href={`/feed/post/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <strong>{post.title}</strong>
                  </a>
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

          {/* boton de ver mas publicaciones */}
          {posts.length < postsTotal ? (
            <button
              onClick={loadMorePosts}
              disabled={loadingMorePosts}
              className="btn btn-small btn-secondary"
              style={{ marginTop: "12px" }}
            >
              {loadingMorePosts ? "Cargando..." : "Ver más"}
            </button>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}

export default UserProfile