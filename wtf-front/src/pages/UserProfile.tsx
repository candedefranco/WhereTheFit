import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

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
  const [followers, setFollowers] = useState<number>(0)
  const [following, setFollowing] = useState<number>(0)
  const [isFollowing, setIsFollowing] = useState(false)
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
    // traigo datos del usuario
    const userRes = await apiFetch(`/users/${id}`)
    const userData = await userRes.json()
    setUser(userData)

    // traigo posts del usuario
    const postsRes = await apiFetch(`/posts/user/${id}`)
    const postsData = await postsRes.json()
    setPosts(postsData)

    // traigo seguidores
    const followersRes = await apiFetch(`/follows/${id}/followers`)
    const followersData = await followersRes.json()
    setFollowers(followersData.length)

    // verifico si lo sigo
    const isFollowingMe = followersData.some((f: any) => f.id === currentUser.id)
    setIsFollowing(isFollowingMe)

    // traigo seguidos
    const followingRes = await apiFetch(`/follows/${id}/following`)
    const followingData = await followingRes.json()
    setFollowing(followingData.length)
  }

  async function handleFollow() {
    if (isFollowing) {
      await apiFetch(`/follows/${id}`, { method: "DELETE" })
      setIsFollowing(false)
      setFollowers(followers - 1)
    } else {
      await apiFetch(`/follows/${id}`, { method: "POST" })
      setIsFollowing(true)
      setFollowers(followers + 1)
    }
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
              className={`btn ${isFollowing ? "btn-secondary" : ""}`}
            >
              {isFollowing ? "Dejar de seguir" : "Seguir"}
            </button>
          </div>
          <div style={{ display: "flex", gap: "24px", marginTop: "12px" }}>
            <p><strong>{followers}</strong> seguidores</p>
            <p><strong>{following}</strong> seguidos</p>
            <p><strong>{posts.length}</strong> publicaciones</p>
          </div>
        </div>

        {/* publicaciones del usuario */}
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Publicaciones ({posts.length})</h3>
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
        </div>
      </div>
    </Layout>
  )
}

export default UserProfile