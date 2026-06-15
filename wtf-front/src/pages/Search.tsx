import { useState } from "react"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

interface Post {
  id: number
  title: string
  description: string
  category: string | null
  image_url: string | null
  images: { id: number; url: string; order: number }[]
  status: string
  created_at: string
  username: string
  user_id: number
  tags: string[]
  likes: number
}

function Search() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [tag, setTag] = useState("")
  const [status, setStatus] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    // armo los query params
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (category) params.append("category", category)
    if (tag) params.append("tag", tag)
    if (status) params.append("status", status)

    const response = await apiFetch(`/posts?${params.toString()}`)
    const data = await response.json()
    setPosts(data)
    setSearched(true)
  }

  return (
    <Layout>
      <div className="container">
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2 style={{ marginBottom: "16px" }}>Buscar publicaciones</h2>

          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas las categorías</option>
              <option value="Camperas">Camperas</option>
              <option value="Pantalones">Pantalones</option>
              <option value="Remeras">Remeras</option>
              <option value="Vestidos">Vestidos</option>
              <option value="Faldas">Faldas</option>
              <option value="Zapatos">Zapatos</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Bolsos">Bolsos</option>
              <option value="Ropa interior">Ropa interior</option>
              <option value="Deportivo">Deportivo</option>
              <option value="Top">Top</option>
              <option value="Otro">Otro</option>
            </select>

            <input
              type="text"
              placeholder="Buscar por tag (ej: vintage)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="active">En búsqueda</option>
              <option value="resolved">Resuelto</option>
            </select>

            <button type="submit" className="btn" style={{ marginTop: "8px" }}>
              Buscar
            </button>
          </form>
        </div>

        {/* resultados */}
        {searched && (
          <div>
            <p style={{ color: "#888", marginBottom: "12px" }}>
              {posts.length === 0 ? "No se encontraron publicaciones." : `${posts.length} resultado(s)`}
            </p>
            {posts.map(post => (
              <div key={post.id} className="card" style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  {/* imagen miniatura */}
                  {(post.images?.[0]?.url || post.image_url) && (
                    <img
                      src={post.images?.[0]?.url || post.image_url || ""}
                      alt={post.title}
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="post-header">
                      <a href={`/feed/post/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <strong>{post.title}</strong>
                      </a>
                      <span className={`status-badge ${post.status}`}>
                        {post.status === "active" ? "En búsqueda" : "Resuelto"}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
                      @{post.username} · {new Date(post.created_at).toLocaleDateString("es-AR")}
                      {post.category && ` · ${post.category}`}
                    </p>
                    {post.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                        {post.tags.map((tag, i) => (
                          <span key={i} className="post-tag-item">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Search