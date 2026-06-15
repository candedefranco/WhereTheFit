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

interface FollowUser {
  id: number
  username: string
}

function Profile() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])

  // guardo las listas enteras de follows y followers
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [following, setFollowing] = useState<FollowUser[]>([])

  // estado para saber que lista mostrar desplegada (o null si estan ocultas)
  const [listType, setListType] = useState<"followers" | "following" | null>(null)

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
    // traigo los posts del usuario logueado
      const postsRes = await apiFetch(`/posts/user/${currentUser.id}`)
      const postsData = await postsRes.json()
      setPosts(postsData)

      // traigo mis seguidores
      const followersRes = await apiFetch(`/follows/${currentUser.id}/followers`)
      const followersData = await followersRes.json()
      setFollowers(followersData)

      // traigo a los que sigo
      const followingRes = await apiFetch(`/follows/${currentUser.id}/following`)
      const followingData = await followingRes.json()
      setFollowing(followingData)
    }

    loadProfileData()
  }, [])

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

  // elijo que lista renderizar segun lo que toco
  const currentList = listType === "followers" ? followers : following

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
              <strong>{followers.length}</strong> seguidores
            </p>
            <p
              onClick={() => setListType(listType === "following" ? null : "following")}
              style={{ cursor: "pointer", color: listType === "following" ? "#007bff" : "inherit" }}
            >
              <strong>{following.length}</strong> seguidos
            </p>
            <p><strong>{posts.length}</strong> publicaciones</p>
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
            </div>
          ) : null}
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
        </div>
      </div>
    </Layout>
  )
}

export default Profile