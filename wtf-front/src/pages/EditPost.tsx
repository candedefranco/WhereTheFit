import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

function EditPost() {
  // estados para guardar los datos del post
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [existingImages, setExistingImages] = useState<{ id: number; url: string; order: number }[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const predefinedTags = ["Vintage", "Streetwear", "Coquette", "Old Money", "Aesthetic", "Minimalist"]

  // estados para Gemini
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
    setExistingImages(data.images || [])
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

  // funcion para pedirle sugerencias de tags a Gemini sobre la imagen
  async function handleSuggestTags(e: React.MouseEvent) {
    e.preventDefault()
    setError("")

    if (imageFiles.length === 0 && existingImages.length === 0) {
      setError("La publicación no tiene imagen para analizar.")
      return
    }

    setIsSuggesting(true)

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("description", description)

      if (imageFiles.length > 0) {
        formData.append("image", imageFiles[0])
      } else if (existingImages.length > 0) {
        // mando la URL y el backend descarga la imagen (evita problemas de CORS con S3)
        formData.append("image_url", existingImages[0].url)
      }

      const response = await fetch("http://localhost:5001/posts/suggest-tags", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        window.location.href = "/login"
        return
      }

      if (response.ok) {
        const newSuggestions = data.tags.filter((t: string) => !tags.includes(t))
        setSuggestedTags(newSuggestions)
      } else {
        setError(data.error || "Error al sugerir tags")
      }
    } catch (err) {
      setError("Error de conexión con la IA")
    } finally {
      setIsSuggesting(false)
    }
  }

  // funcion para pasar un tag de "sugerido" a "seleccionado"
  const acceptSuggestedTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
    }
    setSuggestedTags(suggestedTags.filter(t => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    const token = localStorage.getItem("token")

    // si hay imagenes nuevas, mando todo como FormData
    if (imageFiles.length > 0) {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("tags", tags.join(","))
      imageFiles.forEach((file) => {
        formData.append("images", file)
      })

      const response = await fetch(`http://localhost:5001/posts/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await response.json()
      setIsSaving(false)
      if (response.ok) {
        navigate("/feed")
      } else {
        setError(data.error)
      }
      return
    }

    // si no hay imagenes nuevas, mando solo JSON
    const response = await apiFetch(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, description, category, tags: tags.join(",") }),
    })

    const data = await response.json()
    setIsSaving(false)
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
              <option value="Abrigos">Abrigos</option>
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

            {/* imagenes actuales del post */}
            {existingImages.length > 0 && imageFiles.length === 0 && (
              <div style={{ marginBottom: "8px" }}>
                <p style={{ fontSize: "13px", color: "#888", marginBottom: "6px" }}>Imágenes actuales:</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {existingImages.map((img) => (
                    <img key={img.id} src={img.url} alt="imagen actual" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px" }} />
                  ))}
                </div>
              </div>
            )}

            {/* input para subir imagenes nuevas (reemplazan las actuales) */}
            <div>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "6px" }}>
                {imageFiles.length > 0 ? `${imageFiles.length} imagen(es) nueva(s) seleccionada(s)` : "Cambiar imágenes (opcional, máximo 3)"}
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, 3)
                  setImageFiles(files)
                }}
              />
            </div>

            {/* seccion gemini */}
            <div style={{ marginTop: "12px", marginBottom: "16px" }}>
              <button
                onClick={handleSuggestTags}
                disabled={(imageFiles.length === 0 && existingImages.length === 0) || isSuggesting}
                type="button"
                style={{
                  width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d8b4fe",
                  backgroundColor: "#f0e6ff", color: "#6b21a8", fontWeight: "bold", cursor: (imageFiles.length === 0 && existingImages.length === 0) ? "not-allowed" : "pointer"
                }}
              >
                {isSuggesting ? "Pensando..." : "✨ Sugerir tags con IA"}
              </button>
            </div>

            {suggestedTags.length > 0 ? (
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>
                  Sugerencias de IA (clic para agregar):
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {suggestedTags.map((tag, i) => (
                    <span
                      key={i}
                      onClick={() => acceptSuggestedTag(tag)}
                      style={{ padding: "4px 12px", backgroundColor: "#e2e8f0", color: "#334155", borderRadius: "16px", cursor: "pointer", fontSize: "13px" }}
                    >
                      + {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="btn-row">
              <button type="submit" disabled={isSaving} className="btn">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
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