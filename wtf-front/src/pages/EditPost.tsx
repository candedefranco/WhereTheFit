import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { apiFetch } from "../api"

function EditPost() {
  // estados para guardar los datos del post
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  // estados para fotos viejas y nuevas
  const [existingImages, setExistingImages] = useState<any[]>([]) // las que ya estan en el back
  const [newFiles, setNewFiles] = useState<File[]>([]) // las que elegis ahora
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]) // IDs para borrar
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
    // cargo el array de imagenes del post
    setExistingImages(data.images || [])

    // cargo los tags existentes
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

  // funcion para marcar una imagen de la DB para borrar
  const removeExistingImage = (imageId: number) => {
    setDeletedImageIds([...deletedImageIds, imageId])
    setExistingImages(existingImages.filter(img => img.id !== imageId))
  }

  // funcion para quitar una imagen nueva antes de subirla
  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index))
  }

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
    const formData = new FormData()

    // cargo los textos en el form
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    formData.append("tags", tags.join(","))

    // mando los IDs de las fotos que hay que borrar
    formData.append("deleted_image_ids", JSON.stringify(deletedImageIds))

    // agrego los archivos nuevos al campo 'images'
    newFiles.forEach((file) => {
      formData.append("images", file)
    })

    // mando toodo por PUT
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
  }

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <h2>Editar publicación</h2>

          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} maxLength={500} />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
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

            {/* tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "14px 0" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#444" }}>Estilos (Tags)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {predefinedTags.map(tag => (
                  <button key={tag} type="button" className={`tag-pill ${tags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>#{tag}</button>
                ))}
                {tags.filter(t => !predefinedTags.includes(t)).map(tag => (
                  <button key={tag} type="button" className="tag-pill active" onClick={() => toggleTag(tag)}>#{tag}</button>
                ))}
                <input type="text" placeholder="+ nuevo" value={customTag} onChange={(e) => setCustomTag(e.target.value)} onKeyDown={addCustomTag} style={{ border: "1px dashed #6a9ea8", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", width: "80px", outline: "none" }} />
              </div>
            </div>

            {/* imagenes actuales */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>Imágenes actuales (clic en X para quitar):</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {existingImages.map((img) => (
                  <div key={img.id} style={{ position: "relative" }}>
                    <img src={img.url} style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px" }} />
                    <button type="button" onClick={() => removeExistingImage(img.id)} style={{ position: "absolute", top: -5, right: -5, background: "#ff4d4d", color: "white", borderRadius: "50%", border: "none", cursor: "pointer", width: "22px", height: "22px" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* previsualizacion de fotos nuevas */}
            {newFiles.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>Nuevas para agregar:</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {newFiles.map((file, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <img src={URL.createObjectURL(file)} style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "2px dashed #6a9ea8" }} />
                      <button type="button" onClick={() => removeNewFile(index)} style={{ position: "absolute", top: -5, right: -5, background: "gray", color: "white", borderRadius: "50%", border: "none", cursor: "pointer", width: "22px", height: "22px" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* input para sumar imagenes */}
            <div style={{ marginBottom: "25px" }}>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "6px" }}>Subir más (máximo 3 en total):</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const selection = Array.from(e.target.files || [])
                  const limit = 3 - existingImages.length
                  setNewFiles([...newFiles, ...selection].slice(0, limit))
                }}
              />
            </div>

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