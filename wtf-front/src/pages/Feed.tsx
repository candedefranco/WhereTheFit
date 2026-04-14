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
        <img src={"https://wherethefit.s3.us-east-2.amazonaws.com/Screenshot%202026-04-14%20at%2010.03.53%E2%80%AFAM.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZ2X3UYRKU43YYBUG%2F20260414%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20260414T130449Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIQCOkXlUbhHCdiKrqvmA8O%2F%2BXBDuKwLIuKLdk4%2FbZ%2B8znQIgKPQUKTXeISca4pEdlAcZwWf74DeL8CgLKM%2F7LEtAGGMq4wIIjv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2NzU5MTEzNTM0MjkiDCsDRmVaT2ka%2BguhKCq3AqWCxmqAcrFjth%2BLSauxbMQzFLVJm7VLnPAYWMxoUeFjsuoyv8YAAkN%2FuWHqwj8A9DZnJPTgTUnGGPNYPWfw%2BMkgsuMu01yjQGyz%2FWYQ%2FRe4TkbzIiDoDhul1LgP3EwLCj%2Fw96RO8N08C17esnwEgC5nQhgsqLa8zBhoaglVRwfjZ0ys%2BEHnDTb6G8I6dnzFF4dRb77OMqoDV6EesPTOuE5IO1w3DB7TH5lNvxTZ6fBIyePvNxQEmdBUouapzCMScNuPRnX%2FBWjIbqyGT%2Fw3OQlAIBSKpdFUnSYEuxDW1pc0hEaEhq%2Fnal75k6zPEaP9RIDKCYSr%2FPrXGBQaMSDGErNOmkHdWZe%2BXN4vl4V9Rjh1cb7Ux%2Bsd%2FcydkIHl%2BsHGqfi815OSmzYrciemwq5c1g%2BVOslBe05dMPz0%2BM4GOq0CLmHSNQUth9KJEPuVA3W0Tu84ci5JfgTJ4gDBYiugqfDXfHKdPhpHOnFDhu9Ft2usWdh6PY5%2FP3%2BCE5A7Tuq8djdOx9Qv7v9ynHEnu9sX6cHZwuntbxBS5L8r79xiQVTIaMENYT%2FIxP0LKD0XPOYqVDme%2BLLuHVViIq9sShGeKq9sA7HJOQ%2B39O%2FsyEhsIfnraLmi2gXqT%2Bu81gS7FrFh8Fwzu4L%2BUme3B8uy9loQd3LKx6SzpCsjTZZZ1I%2F3o40l0aKXVqymCC3rh1LmCpkPagNXQjeDA1YOKWdUDAeYRafB16K8ltmVa4JnCLBvsIBuxcN9BMJLyKDnWu27sQ4pgMy7Zdx%2BSi8NJMYX7CFCvZsVa7S4xXB0JacKzG3ppmwOMyvGsHe2dPOqmOrKKQ%3D%3D&X-Amz-Signature=2703eb13d61ce7f90aefd365cdf5f1f030ba64a6642f204dfb6aa7877c6a2a69&X-Amz-SignedHeaders=host&response-content-disposition=inline"}/>

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