import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

const PAGE_SIZE = 10

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

interface FollowUser {
  id: number
  username: string
}

function Profile() {
  const navigate = useNavigate()

  // posts del usuario, con paginacion
  const [posts, setPosts] = useState<Post[]>([])
  const [postsTotal, setPostsTotal] = useState(0)
  const [loadingMorePosts, setLoadingMorePosts] = useState(false)

  // guardo las listas de seguidores y seguidos, con paginacion
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [followersTotal, setFollowersTotal] = useState(0)
  const [loadingMoreFollowers, setLoadingMoreFollowers] = useState(false)

  const [following, setFollowing] = useState<FollowUser[]>([])
  const [followingTotal, setFollowingTotal] = useState(0)
  const [loadingMoreFollowing, setLoadingMoreFollowing] = useState(false)

  // estado para saber que lista mostrar desplegada (o null si estan ocultas)
  const [listType, setListType] = useState<"followers" | "following" | null>(null)

  // loading de la carga inicial del perfil
  const [isLoading, setIsLoading] = useState(true)

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  // estado del toggle de notificaciones por email
  const [emailNotifications, setEmailNotifications] = useState<boolean>(currentUser?.email_notifications ?? true)
  const [savingNotifications, setSavingNotifications] = useState(false)

    // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    async function loadProfileData() {
      setIsLoading(true)

      try {
        // traigo la primera pagina de mis posts
        const postsRes = await apiFetch(`/posts/user/${currentUser.id}?limit=${PAGE_SIZE}&offset=0`)
        const postsData = await postsRes.json()
        setPosts(postsData.items)
        setPostsTotal(postsData.total)

        // traigo la primera pagina de mis seguidores
        const followersRes = await apiFetch(`/follows/${currentUser.id}/followers?limit=${PAGE_SIZE}&offset=0`)
        const followersData = await followersRes.json()
        setFollowers(followersData.items)
        setFollowersTotal(followersData.total)

        // traigo la primera pagina de a los que sigo
        const followingRes = await apiFetch(`/follows/${currentUser.id}/following?limit=${PAGE_SIZE}&offset=0`)
        const followingData = await followingRes.json()
        setFollowing(followingData.items)
        setFollowingTotal(followingData.total)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [])

  // cargo mas seguidores cuando aprieto "ver mas"
  async function loadMoreFollowers() {
    setLoadingMoreFollowers(true)
    try {
      const res = await apiFetch(`/follows/${currentUser.id}/followers?limit=${PAGE_SIZE}&offset=${followers.length}`)
      const data = await res.json()
      setFollowers(prev => [...prev, ...data.items])
      setFollowersTotal(data.total)
    } finally {
      setLoadingMoreFollowers(false)
    }
  }

  // cargo mas seguidos cuando aprieto "ver mas"
  async function loadMoreFollowing() {
    setLoadingMoreFollowing(true)
    try {
      const res = await apiFetch(`/follows/${currentUser.id}/following?limit=${PAGE_SIZE}&offset=${following.length}`)
      const data = await res.json()
      setFollowing(prev => [...prev, ...data.items])
      setFollowingTotal(data.total)
    } finally {
      setLoadingMoreFollowing(false)
    }
  }

  // cargo mas publicaciones cuando aprieto "ver mas"
  async function loadMorePosts() {
    setLoadingMorePosts(true)
    try {
      const res = await apiFetch(`/posts/user/${currentUser.id}?limit=${PAGE_SIZE}&offset=${posts.length}`)
      const data = await res.json()
      setPosts(prev => [...prev, ...data.items])
      setPostsTotal(data.total)
    } finally {
      setLoadingMorePosts(false)
    }
  }

  // prendo o apago las notificaciones por mail
  async function toggleEmailNotifications() {
    setSavingNotifications(true)

    const newValue = !emailNotifications

    const response = await apiFetch(`/users/${currentUser.id}`, {
      method: "PUT",
      body: JSON.stringify({ email_notifications: newValue }),
    })

    if (response.ok) {
      const data = await response.json()
      setEmailNotifications(data.email_notifications)

      // actualizo el localStorage para que quede sincronizado
      const updatedUser = { ...currentUser, email_notifications: data.email_notifications }
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }

    setSavingNotifications(false)
  }

  // devuelvo vacio en vez de null para que typescript no se rompa
  if (!currentUser) return <></>

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

  // elijo que lista renderizar segun lo que toco
  const currentList = listType === "followers" ? followers : following
  const currentTotal = listType === "followers" ? followersTotal : followingTotal
  const loadingMoreCurrent = listType === "followers" ? loadingMoreFollowers : loadingMoreFollowing
  const loadMoreCurrent = listType === "followers" ? loadMoreFollowers : loadMoreFollowing

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

            {/* toggle de notificaciones por email */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
              <strong>Resumen diario por mail:</strong>
              <button
                onClick={toggleEmailNotifications}
                disabled={savingNotifications}
                className={`btn btn-small ${emailNotifications ? "" : "btn-secondary"}`}
              >
                {savingNotifications ? "Guardando..." : emailNotifications ? "Activado ✓" : "Desactivado"}
              </button>
            </div>
          </div>

          {/* barra de estadisticas de follows con toggle */}
          <div style={{ display: "flex", gap: "24px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            <p
              onClick={() => setListType(listType === "followers" ? null : "followers")}
              style={{ cursor: "pointer", color: listType === "followers" ? "#007bff" : "inherit" }}
            >
              <strong>{followersTotal}</strong> seguidores
            </p>
            <p
              onClick={() => setListType(listType === "following" ? null : "following")}
              style={{ cursor: "pointer", color: listType === "following" ? "#007bff" : "inherit" }}
            >
              <strong>{followingTotal}</strong> seguidos
            </p>
            <p><strong>{postsTotal}</strong> publicaciones</p>
          </div>

          {/* muestro la lista desplegable aca abajo */}
          {listType !== null ? (
            <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee" }}>
              <h4 style={{ margin: "0 0 12px 0", color: "#333" }}>
                {listType === "followers" ? "Mis Seguidores" : "Mis Seguidos"}
              </h4>

              {/* mapeo a los usuarios de la lista seleccionada */}
              {currentList.map(u => (
                <div key={u.id} style={{ padding: "8px 0", borderBottom: "1px solid #eaeaea" }}>
                  <a href={`/profile/${u.id}`} style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}>
                    @{u.username}
                  </a>
                </div>
              ))}

              {/* mensajito por si la lista esta vacia */}
              {currentList.length === 0 ? (
                <p style={{ color: "#888", fontSize: "14px", margin: "8px 0 0 0" }}>Todavía no hay gente aquí.</p>
              ) : null}

              {/* boton de ver mas, solo si quedan elementos sin cargar */}
              {currentList.length < currentTotal ? (
                <button
                  onClick={loadMoreCurrent}
                  disabled={loadingMoreCurrent}
                  className="btn btn-small btn-secondary"
                  style={{ marginTop: "12px" }}
                >
                  {loadingMoreCurrent ? "Cargando..." : "Ver más"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* historial de publicaciones */}
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Mis publicaciones ({postsTotal})</h3>

          {posts.length === 0 ? (
            <p style={{ color: "#888" }}>Todavía no publicaste nada.</p>
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
                  {post.category ? ` · ${post.category}` : null}
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

export default Profile