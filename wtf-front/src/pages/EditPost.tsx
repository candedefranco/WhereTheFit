import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

function EditPost() {
  // estados para guardar los datos del post
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [status, setStatus] = useState("active")
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const predefinedTags = ["Vintage", "Streetwear", "Coquette", "Old Money", "Aesthetic", "Minimalist"]

  // obtengo el id del post de la URL (ej: /feed/edit/3)
  const { id } = useParams()

  // traigo el usuario logueado del localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  async function loadPost() {
    // traigo los datos del post para prellenar el formulario
    const response = await apiFetch(`/posts/${id}`)
    const data = await response.json()
    setTitle(data.title)
    setDescription(data.description)
    setCategory(data.category || "")
    setImageUrl(data.image_url || "")
    setStatus(data.status)
    // cargo los tags existentes del post
    setTags(data.tags || [])
  }

  // si no hay sesion, mando al login
  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    loadPost()
  }, [])

  // funcion para seleccionar/deseleccionar tags predefinidos
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else if (tags.length < 5) {
      setTags([...tags, tag])
    }
  }

  // funcion para agregar tags escritos a mano apretando Enter
  const addCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customTag.trim() !== "") {
      e.preventDefault()
      const newTag = customTag.trim().replace("#", "")
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setCustomTag("")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const token = localStorage.getItem("token")

    // si hay imagen nueva, mando todo como FormData
    if (imageFile) {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("status", status)
      formData.append("tags", tags.join(","))
      formData.append("image", imageFile)

      const response = await fetch(`http://localhost:5001/posts/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        navigate("/feed")
      } else {
        setError(data.error)
      }
      return
    }

    // si no hay imagen nueva, mando solo JSON
    const response = await apiFetch(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, description, category, status, tags: tags.join(",") }),
    })

    const data = await response.json()
    if (response.ok) {
      navigate("/feed")
    } else {
      setError(data.error)
    }
  }

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <h2>Editar publicación</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              maxLength={500}
            />

            {/* dropdown de categoria */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Seleccioná una categoría</option>
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

            {/* seccion de tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#444", marginLeft: "4px" }}>Estilos (Tags)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {predefinedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-pill ${tags.includes(tag) ? "active" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
                {tags.filter(t => !predefinedTags.includes(t)).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-pill active"
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="+ nuevo"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={addCustomTag}
                  style={{ border: "1px dashed #6a9ea8", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", width: "80px", outline: "none" }}
                />
              </div>
            </div>

            {/* imagen actual */}
            {imageUrl && !imageFile && (
              <div style={{ marginBottom: "8px" }}>
                <p style={{ fontSize: "13px", color: "#888", marginBottom: "6px" }}>Imagen actual:</p>
                <img src={imageUrl} alt="imagen actual" style={{ width: "120px", borderRadius: "6px" }} />
              </div>
            )}

            {/* input para subir imagen nueva */}
            <div>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "6px" }}>
                {imageFile ? `Nueva imagen: ${imageFile.name}` : "Cambiar imagen (opcional)"}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* selector de estado */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">En búsqueda</option>
              <option value="resolved">Resuelto</option>
            </select>

            <div className="btn-row">
              <button type="submit" className="btn">Guardar cambios</button>
              <a href="/feed" className="btn btn-secondary">Cancelar</a>
            </div>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </Layout>
  )
}

export default EditPost