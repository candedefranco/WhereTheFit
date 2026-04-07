import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

// defino los tipos para TypeScript
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

interface Comment {
  id: number
  text: string
  link: string | null
  created_at: string
  user_id: number
  username: string
}

function PostDetail() {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [newLink, setNewLink] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // obtengo el id del post de la URL (ej: /feed/post/3)
  const { id } = useParams()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  async function loadPost() {
    // traigo los datos del post
    const response = await apiFetch(`/posts/${id}`)
    const data = await response.json()
    setPost(data)
  }

  async function loadComments() {
    // traigo los comentarios del post
    const response = await apiFetch(`/comments/${id}`)
    const data = await response.json()
    setComments(data)
  }

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadPost()
    loadComments()
  }, [])

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // mando el comentario al back
    const response = await apiFetch(`/comments/${id}`, {
      method: "POST",
      body: JSON.stringify({
        text: newComment,
        link: newLink || null,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      // limpio el formulario y recargo los comentarios
      setNewComment("")
      setNewLink("")
      loadComments()
    } else {
      setError(data.error)
    }
  }

  async function deleteComment(commentId: number) {
    if (!confirm("¿Segura que querés borrar este comentario?")) return

    const response = await apiFetch(`/comments/${commentId}`, {
      method: "DELETE",
    })

    if (response.ok) {
      // recargo los comentarios despues de borrar
      loadComments()
    }
  }

  if (!post) return null

  return (
    <Layout>
      <div className="container">
        {/* detalle del post */}
        <div className="card post-card">
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="post-image" />
          )}
          <div className="post-content">
            <div className="post-header">
              <h2>{post.title}</h2>
              <span className={`status-badge ${post.status}`}>
                {post.status === "active" ? "En búsqueda" : "Resuelto"}
              </span>
            </div>
            <p className="post-meta">@{post.username} · {new Date(post.created_at).toLocaleDateString("es-AR")}</p>
            {post.category && <p className="post-category">{post.category}</p>}
            <p className="post-description">{post.description}</p>

            {/* botones de editar/borrar solo para el dueno del post */}
            {currentUser && currentUser.id === post.user_id && (
              <div className="btn-row" style={{ marginTop: "12px" }}>
                <a href={`/feed/edit/${post.id}`} className="btn btn-small">Editar</a>
              </div>
            )}
          </div>
        </div>

        {/* seccion de comentarios */}
        <div className="card" style={{ marginTop: "16px" }}>
          <h3 style={{ marginBottom: "16px" }}>Comentarios ({comments.length})</h3>

          {comments.length === 0 ? (
            <p style={{ color: "#888", marginBottom: "16px" }}>Todavía no hay comentarios. ¡Sé el primero!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-username">@{comment.username}</span>
                  <span className="comment-date">{new Date(comment.created_at).toLocaleDateString("es-AR")}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
                {comment.link && (
                  <a href={comment.link} target="_blank" rel="noreferrer" className="comment-link">
                    {comment.link}
                  </a>
                )}
                {/* solo muestro el boton de borrar si el comentario es del usuario logueado */}
                {currentUser && currentUser.id === comment.user_id && (
                  <button onClick={() => deleteComment(comment.id)} className="btn btn-danger btn-small" style={{ marginTop: "8px" }}>
                    Borrar
                  </button>
                )}
              </div>
            ))
          )}

          {/* formulario para agregar comentario */}
          <form onSubmit={handleComment} style={{ marginTop: "16px" }}>
            <textarea
              placeholder="Añadí un comentario... (ej: Vi algo similar en Zara Palermo)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              rows={3}
            />
            <input
              type="text"
              placeholder="Link (opcional, ej: instagram.com/tienda)"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
            />
            <button type="submit" className="btn">Comentar</button>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </Layout>
  )
}

export default PostDetail