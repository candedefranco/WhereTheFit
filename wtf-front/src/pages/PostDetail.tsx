import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"
import ConfirmModal from "../components/ConfirmModal"
import ImageCarousel from "../components/ImageCarousel"

// defino los tipos para TypeScript
interface Post {
  id: number
  title: string
  description: string
  category: string | null
  image_url: string | null
  images: { id: number; url: string; order: number }[]
  status: string
  created_at: string
  user_id: number
  username: string
  resolved_location: string | null
  resolved_instagram: string | null
  resolved_link: string | null
  likes: number
  liked_by: number[]
}

interface Comment {
  id: number
  text: string
  link: string | null
  created_at: string
  user_id: number
  username: string
  parent_id: number | null
}

function PostDetail() {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [newLink, setNewLink] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null)
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [resolvedLocation, setResolvedLocation] = useState("")
  const [resolvedInstagram, setResolvedInstagram] = useState("")
  const [resolvedLink, setResolvedLink] = useState("")
  const [likes, setLikes] = useState<number>(0)
  const [liked, setLiked] = useState<boolean>(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isDeletingComment, setIsDeletingComment] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(true)

  const navigate = useNavigate()
  const { id } = useParams()
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  async function loadPost() {
    setIsLoadingPost(true)
    const response = await apiFetch(`/posts/${id}`)
    const data = await response.json()
    setPost(data)
    setLikes(data.likes)
    setLiked(data.liked_by.includes(currentUser.id))
    setIsLoadingPost(false)
  }

  async function loadComments() {
    const response = await apiFetch(`/comments/${id}`)
    const data = await response.json()
    setComments(data)
  }

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadPost()
    loadComments()
  }, [])

  async function handleLike() {
    setIsLiking(true)
    if (liked) {
      await apiFetch(`/likes/${id}`, { method: "DELETE" })
      setLiked(false)
      setLikes(likes - 1)
    } else {
      await apiFetch(`/likes/${id}`, { method: "POST" })
      setLiked(true)
      setLikes(likes + 1)
    }
    setIsLiking(false)
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (newLink && !/^https:\/\/.+/.test(newLink)) {
      setError("El link debe empezar con https://")
      return
    }

    setIsCommenting(true)
    const response = await apiFetch(`/comments/${id}`, {
      method: "POST",
      body: JSON.stringify({
        text: newComment,
        link: newLink || null,
        parent_id: replyingTo,
      }),
    })

    const data = await response.json()
    setIsCommenting(false)

    if (response.ok) {
      setNewComment("")
      setNewLink("")
      setReplyingTo(null)
      loadComments()
    } else {
      setError(data.error)
    }
  }

  async function deleteComment(commentId: number) {
    setCommentToDelete(commentId)
    setShowCommentModal(true)
  }

  async function confirmDeleteComment() {
    if (!commentToDelete) return

    setIsDeletingComment(true)
    const response = await apiFetch(`/comments/${commentToDelete}`, {
      method: "DELETE",
    })

    setShowCommentModal(false)
    setCommentToDelete(null)
    setIsDeletingComment(false)

    if (response.ok) {
      loadComments()
    }
  }

  const rootComments = comments.filter(c => c.parent_id === null)
  const getReplies = (commentId: number) => comments.filter(c => c.parent_id === commentId)

  if (isLoadingPost) {
    return (
      <Layout>
        <div className="container">
          <div className="loading-spinner-container"><div className="loading-spinner" /></div>
        </div>
      </Layout>
    )
  }

  if (!post) return null

  return (
    <Layout>
      <div className="container">
        <div className="card post-card">
          {post.images && post.images.length > 0 ? (
            <ImageCarousel images={post.images} title={post.title} />
          ) : post.image_url ? (
            <img src={post.image_url} alt={post.title} className="post-image" />
          ) : null}
          <div className="post-content">
            <div className="post-header">
              <h2>{post.title}</h2>
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

            {/* boton de like */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`btn btn-small ${liked ? "btn-danger" : "btn-secondary"}`}
              >
                {isLiking ? "..." : liked ? "❤️" : "🤍"} {likes} {likes === 1 ? "like" : "likes"}
              </button>
            </div>

            {post.description && (
              <div className="post-detail-description" style={{ marginTop: "16px", color: "#444", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                <p>{post.description}</p>
              </div>
            )}

            {post.status === "resolved" && (post.resolved_location || post.resolved_instagram || post.resolved_link) && (
              <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#e8f5e9", borderRadius: "8px", overflow: "hidden" }}>
                <p style={{ fontWeight: 600, color: "#2e7d32", marginBottom: "8px" }}>✓ Encontrado en:</p>
                {post.resolved_location && <p style={{ fontSize: "14px" }}>📍 {post.resolved_location}</p>}
                {post.resolved_instagram && <p style={{ fontSize: "14px" }}>📸 {post.resolved_instagram}</p>}
                {post.resolved_link && (
                  <a href={post.resolved_link} target="_blank" rel="noreferrer" className="resolved-link">
                    🔗 {post.resolved_link}
                  </a>
                )}
              </div>
            )}

            {currentUser && currentUser.id === post.user_id && (
              <div style={{ marginTop: "12px" }}>
                <div className="btn-row">
                  <a href={`/feed/edit/${post.id}`} className="btn btn-small">Editar</a>
                  {post.status === "active" && (
                    <button
                      onClick={() => setShowResolveForm(!showResolveForm)}
                      className="btn btn-small"
                      style={{ backgroundColor: "#2e7d32", color: "white" }}
                    >
                      {showResolveForm ? "Cancelar" : "✓ Marcar como resuelto"}
                    </button>
                  )}
                </div>

                {showResolveForm && (
                  <div style={{ marginTop: "12px", padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                    <p style={{ fontWeight: 600, marginBottom: "12px" }}>¿Dónde lo encontraste?</p>
                    <input
                      type="text"
                      placeholder="Lugar físico (ej: Zara Palermo)"
                      value={resolvedLocation}
                      onChange={(e) => setResolvedLocation(e.target.value)}
                      style={{ marginBottom: "8px" }}
                    />
                    <input
                      type="text"
                      placeholder="Instagram (ej: @tienda)"
                      value={resolvedInstagram}
                      onChange={(e) => setResolvedInstagram(e.target.value)}
                      style={{ marginBottom: "8px" }}
                    />
                    <input
                      type="text"
                      placeholder="Link (ej: https://tienda.com)"
                      value={resolvedLink}
                      onChange={(e) => setResolvedLink(e.target.value)}
                      style={{ marginBottom: "12px" }}
                    />
                    {error && <p className="error" style={{ marginBottom: "8px" }}>{error}</p>}
                    <button
                      onClick={async () => {
                        if (resolvedLink && !/^https:\/\/.+/.test(resolvedLink)) {
                          setError("El link debe empezar con https://")
                          return
                        }
                        setIsResolving(true)
                        await apiFetch(`/posts/${post.id}`, {
                          method: "PUT",
                          body: JSON.stringify({
                            status: "resolved",
                            resolved_location: resolvedLocation,
                            resolved_instagram: resolvedInstagram,
                            resolved_link: resolvedLink,
                          }),
                        })
                        setIsResolving(false)
                        setShowResolveForm(false)
                        loadPost()
                      }}
                      disabled={isResolving}
                      className="btn btn-small"
                      style={{ backgroundColor: "#2e7d32", color: "white" }}
                    >
                      {isResolving ? "Guardando..." : "Confirmar"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: "16px" }}>
          <h3 style={{ marginBottom: "16px" }}>Comentarios ({comments.length})</h3>

          {rootComments.length === 0 ? (
            <p style={{ color: "#888", marginBottom: "16px" }}>Todavía no hay comentarios. ¡Sé el primero!</p>
          ) : (
            rootComments.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <a href={`/profile/${comment.user_id}`} className="comment-username"
                    style={{ textDecoration: "none", fontWeight: "bold", color: "inherit" }}>
                    @{comment.username}
                  </a>
                  <span className="comment-date">{new Date(comment.created_at).toLocaleDateString("es-AR")}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
                {comment.link && (
                  <a href={comment.link} target="_blank" rel="noreferrer" className="comment-link">
                    {comment.link}
                  </a>
                )}

                <div className="btn-row" style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="btn btn-small btn-secondary"
                  >
                    {replyingTo === comment.id ? "Cancelar" : "Responder"}
                  </button>

                  {currentUser && currentUser.id === comment.user_id && (
                    <button onClick={() => deleteComment(comment.id)} className="btn btn-danger btn-small">
                      Borrar
                    </button>
                  )}
                </div>

                {replyingTo === comment.id && (
                  <form onSubmit={handleComment} style={{ marginTop: "12px", marginLeft: "16px" }}>
                    <textarea
                      placeholder={`Respondé a @${comment.username}...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      rows={2}
                      maxLength={300}
                    />
                    <button type="submit" disabled={isCommenting} className="btn btn-small" style={{ marginTop: "8px" }}>
                      {isCommenting ? "Enviando..." : "Comentar"}
                    </button>
                  </form>
                )}

                {getReplies(comment.id).map(reply => (
                  <div key={reply.id} className="comment comment-reply">
                    <div className="comment-header">
                      <span className="comment-username">@{reply.username}</span>
                      <span className="comment-date">{new Date(reply.created_at).toLocaleDateString("es-AR")}</span>
                    </div>
                    <p className="comment-text">{reply.text}</p>
                    {reply.link && (
                      <a href={reply.link} target="_blank" rel="noreferrer" className="comment-link">
                        {reply.link}
                      </a>
                    )}
                    <div className="btn-row" style={{ marginTop: "8px" }}>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="btn btn-small btn-secondary"
                      >
                        {replyingTo === comment.id ? "Cancelar" : "Responder"}
                      </button>
                      {currentUser && currentUser.id === reply.user_id && (
                        <button onClick={() => deleteComment(reply.id)} className="btn btn-danger btn-small">
                          Borrar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          {replyingTo === null && (
            <form onSubmit={handleComment} style={{ marginTop: "16px" }}>
              <textarea
                placeholder="Añadí un comentario... (ej: Vi algo similar en Zara Palermo)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                rows={3}
                maxLength={300}
              />
              <input
                type="text"
                placeholder="Link (opcional, ej: https://tienda.com)"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
              <button type="submit" disabled={isCommenting} className="btn">
                {isCommenting ? "Enviando..." : "Comentar"}
              </button>
            </form>
          )}

          {error && <p className="error">{error}</p>}
        </div>
      </div>

      {showCommentModal && (
        <ConfirmModal
          message="¿Segura que querés borrar este comentario?"
          onConfirm={confirmDeleteComment}
          onCancel={() => { setShowCommentModal(false); setCommentToDelete(null) }}
          loading={isDeletingComment}
        />
      )}
    </Layout>
  )
}

export default PostDetail